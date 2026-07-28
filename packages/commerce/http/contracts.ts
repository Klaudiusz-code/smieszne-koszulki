import type { AddCartItem, Cart, Checkout, CheckoutAddress, CheckoutResult, PlaceOrderInput, ProductFilters, ProductPage } from "../core/models";
import * as s from "./schema";
export interface Endpoint<I, O> { input: s.Schema<I>; output: s.Schema<O> }
export function endpoint<I, O>(input: s.Schema<I>, output: s.Schema<O>): Endpoint<I, O> { return { input, output }; }
export const empty = s.object({});
export const ok = s.object({ ok: s.refine(s.boolean, (v) => v) });
const maybeText = s.optional(s.nullable(s.string));
const image = s.nullable(s.object({ sourceUrl: s.string, altText: maybeText }));
export const product = s.object({ type: s.optional(s.oneOf(["simple", "variable"])), id: s.string, databaseId: s.integer(1), name: s.string, slug: s.string, image,
  price: maybeText, regularPrice: maybeText, salePrice: maybeText, onSale: s.optional(s.nullable(s.boolean)),
  stockStatus: maybeText, stockQuantity: s.optional(s.nullable(s.number)), categorySlugs: s.array(s.string) });
export const productPage: s.Schema<ProductPage> = s.object({ products: s.array(product), found: s.integer(), hasNextPage: s.boolean, endCursor: s.nullable(s.string) });
export const filters: s.Schema<ProductFilters> = s.object({ search: s.text(200), sort: s.oneOf(["latest", "price_asc", "price_desc", "name_asc", "name_desc"]),
  stock: s.oneOf(["all", "available", "unavailable"]), minPrice: s.nullable(s.refine(s.number, (v) => v >= 0)), maxPrice: s.nullable(s.refine(s.number, (v) => v >= 0)),
  taxonomyFilters: s.array(s.object({ taxonomy: s.text(64, 1), terms: s.array(s.text(200, 1), 30) }), 10), categoryId: s.optional(s.integer(1)), pageSize: s.integer(1, 100) });
const addressShape = { firstName: s.text(), lastName: s.text(), address1: s.text(), address2: s.text(), city: s.text(), postcode: s.text(32), country: s.text(2), phone: s.text(40), email: s.optional(s.text(254)), company: s.optional(s.text()) };
export const address: s.Schema<CheckoutAddress> = s.object(addressShape);
export const partialAddress: s.Schema<Partial<CheckoutAddress>> = s.object(Object.fromEntries(Object.entries(addressShape).map(([key, value]) => [key, s.optional(value)])));
const cartShape = { subtotal: s.string, items: s.array(s.object({ key: s.string, quantity: s.integer(1), subtotal: s.string, total: s.string,
  product: s.object({ databaseId: s.integer(1), slug: maybeText, name: s.string, image, categoryIds: s.array(s.integer(1)), attributes: s.array(s.object({ name: s.string, label: s.string, terms: s.array(s.object({ slug: s.string, name: s.string })) })) }),
  variation: s.nullable(s.object({ databaseId: s.optional(s.integer(1)), attributes: s.array(s.object({ name: s.string, value: s.string })) })) })) };
export const cart: s.Schema<Cart> = s.object(cartShape);
export const checkout: s.Schema<Checkout> = s.object({ ...cartShape, appliedCoupons: s.array(s.object({ code: s.string, discountAmount: s.string })),
  shippingTotal: s.string, total: s.string, rawTotal: s.string, shippingRates: s.array(s.object({ id: s.string, label: s.string, cost: s.string, methodId: s.optional(s.string) })),
  chosenShipping: s.array(s.string), paymentGateways: s.array(s.object({ id: s.string, title: s.string, description: maybeText, icon: maybeText })), billing: s.nullable(address), shipping: s.nullable(address) });
export const requestId = s.refine(s.text(100, 16), (v) => /^[A-Za-z0-9_-]+$/.test(v));
export const paymentUrl = s.refine(s.string, (v) => { try { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } });
export const checkoutResult: s.Schema<CheckoutResult> = { parse(v) {
  const { status } = s.object({ status: s.oneOf(["completed", "pending", "rejected"]) }).parse(v);
  if (status !== "completed") return { status, ...s.object({ message: s.optional(s.string) }).parse(v) };
  return { status, ...s.object({ orderId: s.integer(1), orderKey: s.text(200, 1), needsPayment: s.boolean, redirectUrl: s.optional(paymentUrl) }).parse(v) };
} };
export const orderInput: s.Schema<PlaceOrderInput> = s.object({ acceptedTerms: s.refine(s.boolean, (v) => v), expectedTotal: s.refine(s.number, (v) => v >= 0),
  billing: s.nullable(partialAddress), shipping: s.nullable(address), shippingMethods: s.array(s.text(200, 1), 10), paymentMethod: s.text(100, 1), parcelLocker: s.optional(s.text(100)), invoiceRequested: s.optional(s.boolean), invoiceTaxId: s.optional(s.text(32)) });
const coupon = s.object({ code: s.text(200, 1) });
export const commerceEndpoints = {
  "products/search": endpoint(s.object({ filters, after: s.optional(s.nullable(s.text(1000))) }), productPage),
  "cart": endpoint(empty, cart),
  "cart/add": endpoint(s.object({ productId: s.integer(1), variationId: s.optional(s.integer(1)), quantity: s.optional(s.integer(1, 999)) }) as s.Schema<AddCartItem>, ok),
  "cart/remove": endpoint(s.object({ keys: s.array(s.text(200, 1), 100) }), ok),
  "cart/quantity": endpoint(s.object({ key: s.text(200, 1), quantity: s.integer(0, 999) }), ok),
  "checkout": endpoint(empty, checkout),
  "checkout/address": endpoint(s.object({ type: s.oneOf(["billing", "shipping"]), address: partialAddress }), ok),
  "checkout/shipping": endpoint(s.object({ ids: s.array(s.text(200, 1), 10) }), ok),
  "checkout/coupons/apply": endpoint(coupon, ok),
  "checkout/coupons/remove": endpoint(coupon, ok),
  "orders/place": endpoint(s.object({ input: orderInput, requestId }), checkoutResult),
  "orders/status": endpoint(s.object({ requestId }), checkoutResult),
};
