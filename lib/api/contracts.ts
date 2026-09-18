/** Application-owned JSON contracts. No backend operation names or envelopes. */
import * as s from "@/packages/commerce/http/schema";
import { commerceEndpoints, endpoint, empty, paymentUrl } from "@/packages/commerce/http/contracts";
export const card = s.object({ type: s.optional(s.oneOf(["simple", "variable"])), id: s.string, databaseId: s.integer(1), name: s.string, slug: s.string,
  image: s.nullable(s.object({ sourceUrl: s.string, altText: s.optional(s.nullable(s.string)) })),
  price: s.optional(s.nullable(s.string)), regularPrice: s.optional(s.nullable(s.string)), salePrice: s.optional(s.nullable(s.string)), onSale: s.optional(s.nullable(s.boolean)) });
const orderKey = s.object({ orderId: s.integer(1), orderKey: s.text(200, 1) });
export const order = s.object({ databaseId: s.integer(1), orderNumber: s.string, status: s.string, date: s.string,
  subtotal: s.nullable(s.string), shippingTotal: s.nullable(s.string), total: s.nullable(s.string), paymentMethodTitle: s.nullable(s.string), shippingMethodTitle: s.nullable(s.string), needsPayment: s.nullable(s.boolean), lineItems: s.array(s.object({ name: s.string, quantity: s.integer(1) })) });
export type OrderReceipt = s.Infer<typeof order>;
const account = s.object({ firstName: s.string, lastName: s.string, displayName: s.string, email: s.string, username: s.string });
const accountInput = s.object({ firstName: s.text(), lastName: s.text(), displayName: s.text(), email: s.refine(s.text(254), (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) });
export const customerAddress = s.object({ firstName: s.string, lastName: s.string, company: s.string, address1: s.string, address2: s.string, city: s.string, state: s.string, postcode: s.string, country: s.string, email: s.optional(s.string), phone: s.string });
const addressInput = s.object({ firstName: s.optional(s.text()), lastName: s.optional(s.text()), company: s.optional(s.text()), address1: s.optional(s.text()), address2: s.optional(s.text()), city: s.optional(s.text()), state: s.optional(s.text()), postcode: s.optional(s.text(32)), country: s.optional(s.text(2)), email: s.optional(s.text(254)), phone: s.optional(s.text(40)) });
export const accountOrder = s.object({ databaseId: s.integer(1), orderNumber: s.string, status: s.string, date: s.string, total: s.string, paymentMethodTitle: s.string, items: s.array(s.object({ quantity: s.integer(1), name: s.string })) });
export const download = s.object({ url: s.string, name: s.string, accessExpires: s.nullable(s.string), downloadsRemaining: s.nullable(s.number), product: s.nullable(s.object({ name: s.string })) });
export const endpoints = {
  ...commerceEndpoints,
  "cart/recommendations": endpoint(s.object({ categoryId: s.integer(1) }), s.array(card)),
  "orders/receipt": endpoint(orderKey, s.nullable(order)),
  "orders/payment": endpoint(orderKey, s.object({ success: s.boolean, redirectUrl: s.optional(s.nullable(paymentUrl)), message: s.optional(s.nullable(s.string)) })),
  "products/review": endpoint(s.object({ productId: s.integer(1), content: s.text(10000, 1), rating: s.integer(1, 5), author: s.optional(s.text(200)), authorEmail: s.optional(s.text(254)) }), s.object({ author: s.string, date: s.nullable(s.string), status: s.nullable(s.string), rating: s.nullable(s.number) })),
  "account": endpoint(empty, account),
  "account/update": endpoint(accountInput, account),
  "account/addresses": endpoint(empty, s.object({ billing: s.nullable(customerAddress), shipping: s.nullable(customerAddress) })),
  "account/address": endpoint(s.object({ type: s.oneOf(["billing", "shipping"]), address: addressInput }), customerAddress),
  "account/orders": endpoint(empty, s.array(accountOrder)),
  "account/files": endpoint(empty, s.array(download)),
};
export type StorePath = keyof typeof endpoints;
export type Input<P extends StorePath> = s.Infer<(typeof endpoints)[P]["input"]>;
export type Output<P extends StorePath> = s.Infer<(typeof endpoints)[P]["output"]>;
