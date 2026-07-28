import "server-only";
import { createWooCommerceAdapter } from "@/packages/commerce/woocommerce";
import type { GqlOperation, WordPressTransport, OperationVariables, OperationResult } from "./documents";

import { endpoints } from "@/lib/api/contracts";
import { addressInput } from "@/packages/commerce/woocommerce/inputs";
import { CommerceError } from "@/packages/commerce/core/errors";
import type { StoreServices } from "../store";

const confirmed = async (write: Promise<void>) => { await write; return { ok: true }; };
function required<T>(v: T | null | undefined): T { if (v == null) throw new CommerceError("response", "Missing backend result"); return v; }
export function createWordPressStore(transport: WordPressTransport): StoreServices {
  const commerce = createWooCommerceAdapter(transport);
  async function query<K extends GqlOperation>(name: K, vars: OperationVariables<K>): Promise<OperationResult<K>> {
    return required((await transport(name, vars)).data);
  }
  return {
    "products/search": ({ filters, after }) => commerce.products(filters, after),
    cart: () => commerce.cart(), "cart/add": (input) => confirmed(commerce.addItem(input)),
    "cart/remove": ({ keys }) => confirmed(commerce.removeItems(keys)), "cart/quantity": ({ key, quantity }) => confirmed(commerce.updateQuantity(key, quantity)),
    checkout: () => commerce.checkout(), "checkout/address": ({ type, address }) => confirmed(commerce.saveAddress(type, address)),
    "checkout/shipping": ({ ids }) => confirmed(commerce.selectShipping(ids)),
    "checkout/coupons/apply": ({ code }) => confirmed(commerce.applyCoupon(code.trim())),
    "checkout/coupons/remove": ({ code }) => confirmed(commerce.removeCoupon(code.trim())),
    "orders/place": ({ input, requestId }) => commerce.placeOrder(input, requestId), "orders/status": ({ requestId }) => commerce.checkoutAttempt(requestId),
    async "cart/recommendations"(input) { return endpoints["cart/recommendations"].output.parse(required((await query("SimilarCartProducts", input)).products?.nodes).map((p) => ({ ...p, type: p.__typename === "VariableProduct" ? "variable" : "simple" }))); },
    async "orders/receipt"(input) { const data = await query("GetOrderReceived", input); if (!("orderByKey" in data)) throw new CommerceError("response", "Missing order result"); return endpoints["orders/receipt"].output.parse(data.orderByKey); },
    async "orders/payment"(input) { return endpoints["orders/payment"].output.parse(required((await query("OrderPaymentRedirect", input)).orderPaymentRedirect)); },
    async "products/review"({ productId, ...input }) {
      const data = await query("WriteReview", { input: { ...input, commentOn: productId } });
      const review = required(data.writeReview?.review);
      return { author: review.author?.node?.name ?? "Klient", date: review.date, status: review.status, rating: required(data.writeReview).rating };
    },
    async account() { return endpoints.account.output.parse(required((await query("CustomerAccountQuery", {})).customer)); },
    async "account/update"(input) { return endpoints.account.output.parse(required((await query("UpdateAccount", input)).updateCustomer?.customer)); },
    async "account/addresses"() { return endpoints["account/addresses"].output.parse(required((await query("CustomerAddressesQuery", {})).customer)); },
    async "account/address"({ type, address }) {
      const input = { ...required(addressInput(address)), state: address.state };
      const updated = type === "billing"
        ? (await query("UpdateBillingAddress", { billing: input })).updateCustomer?.customer?.billing
        : (await query("UpdateShippingAddress", { shipping: input })).updateCustomer?.customer?.shipping;
      return endpoints["account/address"].output.parse(required(updated));
    },
    async "account/orders"() {
      const customer = required((await query("CustomerOrdersQuery", {})).customer);
      return endpoints["account/orders"].output.parse(required(customer.orders?.nodes).map(({ lineItems, ...order }) => ({ ...order, items: required(lineItems).nodes.map((item) => ({ quantity: item.quantity, name: item.product?.node?.name ?? "Produkt" })) })));
    },
    async "account/files"() { return endpoints["account/files"].output.parse(required((await query("CustomerDownloadableItemsQuery", {})).customer?.downloadableItems?.nodes)); },
  };
}
