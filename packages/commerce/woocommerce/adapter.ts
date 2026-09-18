import { CommerceError } from "../core/errors";
import type { Cart, CheckoutResult, CommerceAdapter } from "../core/models";
import { cart as cartSchema, checkout as checkoutSchema, productPage } from "../http/contracts";
import { addressInput, taxonomyInput } from "./inputs";
import { getProductQueryVariables } from "./catalog";
import { assertGraphQlSuccess } from "./response";
import { required } from "./graphql";

import { type CommerceOperation, type OperationResult, type OperationVariables, type OperationTransport } from "./documents";
export type { OperationTransport, CommerceOperation } from "./documents";
import type { CartQueryQuery } from "./generated";
type CartWire = NonNullable<CartQueryQuery["cart"]>;

export function mapCart(wire: CartWire): Cart {
  const nodes = required(wire.contents?.nodes, "cart.contents");
  return cartSchema.parse({
    subtotal: required(wire.subtotal, "cart.subtotal"),
    items: nodes.map((item) => {
      const product = required(item.product?.node, "cart.product");
      return {
        key: item.key, quantity: item.quantity, subtotal: item.subtotal, total: item.total,
        product: {
          databaseId: product.databaseId, slug: product.slug, name: product.name, image: product.image,
          categoryIds: (product.productCategories?.nodes ?? []).map((category) => category.databaseId),
          attributes: (("attributes" in product ? product.attributes?.nodes : []) ?? []).map((attribute) => ({ name: attribute.name, label: attribute.label, terms: ("terms" in attribute ? attribute.terms?.nodes : []) ?? [] })),
        },
        variation: item.variation ? { databaseId: item.variation.node.databaseId, attributes: item.variation.node.attributes?.nodes ?? [] } : null,
      };
    }),
  });
}

function mapResult(value: unknown): CheckoutResult {
  if (!value || typeof value !== "object") throw new CommerceError("response", "Missing checkout result");
  const result = value as Record<string, unknown>;
  if (result.status === "pending" || result.status === "rejected") return { status: result.status, message: typeof result.message === "string" ? result.message : undefined };
  if (result.status !== "completed" || !Number.isInteger(result.orderId) || Number(result.orderId) <= 0 || typeof result.orderKey !== "string" || !result.orderKey || typeof result.needsPayment !== "boolean") {
    throw new CommerceError("response", "Invalid completed order");
  }
  let redirectUrl: string | undefined;
  if (result.needsPayment && result.redirectUrl) {
    try {
      const url = new URL(String(result.redirectUrl));
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
      redirectUrl = url.href;
    } catch { throw new CommerceError("response", "Invalid payment redirect"); }
  }
  return { status: "completed", orderId: Number(result.orderId), orderKey: result.orderKey, needsPayment: result.needsPayment, redirectUrl };
}

/** The server injects transport and session handling; the adapter maps backend data to core models. */
export function createWooCommerceAdapter(transport: OperationTransport): CommerceAdapter {
  async function query<K extends CommerceOperation>(operation: K, variables: OperationVariables<K>): Promise<OperationResult<K>> {
    const response = await transport(operation, variables);
    assertGraphQlSuccess(response);
    return required(response.data, `${operation}.data`);
  }
  async function mutation<K extends CommerceOperation>(operation: K, variables: OperationVariables<K>, confirmation: (data: OperationResult<K>) => unknown) {
    const data = await query(operation, variables);
    required(confirmation(data), `${operation}.confirmation`);
  }
  return {
    async products(filters, after = null) {
      const data = await query("Products", {
        first: filters.pageSize, after, categoryId: filters.categoryId ?? null,
        taxonomyFilter: filters.taxonomyFilters.length ? taxonomyInput(filters.taxonomyFilters) : null,
        ...getProductQueryVariables(filters),
      });
      const connection = required(data.products, "products");
      const pageInfo = required(connection.pageInfo, "products.pageInfo");
      if (pageInfo.hasNextPage && (!pageInfo.endCursor || pageInfo.endCursor === after)) throw new CommerceError("response", "Pagination did not advance");
      return productPage.parse({
        products: required(connection.nodes, "products.nodes").map(({ productCategories, __typename, ...product }) => ({ ...product, type: __typename === "VariableProduct" ? "variable" as const : "simple" as const, categorySlugs: (productCategories?.nodes ?? []).map((category) => category.slug) })),
        found: connection.found, ...pageInfo,
      });
    },
    async cart() { const data = await query("CartQuery", {}); return mapCart(required(data.cart, "cart")); },
    addItem: ({ productId, variationId, quantity = 1 }) => mutation("AddToCart", { productId, variationId, quantity }, data => data.addToCart?.cart),
    removeItems: (keys) => mutation("RemoveItemsFromCart", { keys }, data => data.removeItemsFromCart?.cart),
    updateQuantity: (key, quantity) => mutation("UpdateItemQuantities", { key, quantity }, data => data.updateItemQuantities?.cart),
    async checkout() {
      const data = await query("CheckoutQuery", {});
      const cart = required(data.cart, "checkout.cart");
      return checkoutSchema.parse({
        ...mapCart(cart), appliedCoupons: cart.appliedCoupons ?? [], shippingTotal: cart.shippingTotal,
        total: cart.total, rawTotal: required(cart.rawTotal, "checkout.rawTotal"),
        shippingRates: cart.availableShippingMethods?.[0]?.rates ?? [], chosenShipping: cart.chosenShippingMethods ?? [],
        paymentGateways: data.paymentGateways?.nodes ?? [], billing: data.customer?.billing ?? null, shipping: data.customer?.shipping ?? null,
      });
    },
    saveAddress: (type, address) => mutation("UpdateCustomer", { input: { [type]: addressInput(address) } }, data => data.updateCustomer?.customer),
    selectShipping: (shippingMethods) => mutation("UpdateShippingMethod", { shippingMethods }, data => data.updateShippingMethod?.cart),
    applyCoupon: (code) => mutation("ApplyCoupon", { code }, data => data.applyCoupon?.cart),
    removeCoupon: (code) => mutation("RemoveCoupon", { codes: [code] }, data => data.removeCoupons?.cart),
    async placeOrder(input, requestId) {
      const data = await query("PlaceOrder", { input: {
        requestId, acceptedTerms: input.acceptedTerms, expectedTotal: input.expectedTotal,
        checkout: { billing: addressInput(input.billing), shipping: addressInput(input.shipping), shippingMethod: input.shippingMethods, paymentMethod: input.paymentMethod },
        parcelLocker: input.parcelLocker, invoiceRequested: input.invoiceRequested, invoiceTaxId: input.invoiceTaxId,
      } });
      return mapResult(data.storeCheckout);
    },
    async checkoutAttempt(requestId) { return mapResult((await query("CheckoutAttempt", { requestId })).storeCheckoutStatus); },
  };
}
