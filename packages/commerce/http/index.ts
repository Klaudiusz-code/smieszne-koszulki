import type { CommerceAdapter } from "../core/models";
import { ApiError, createApiClient } from "./client";
import { commerceEndpoints as e } from "./contracts";
export { createApiClient, ApiError } from "./client";
export function createHttpCommerceAdapter(request = createApiClient()): CommerceAdapter {
  return {
    products: (filters, after) => request("products/search", e["products/search"], { filters, after }),
    cart: () => request("cart", e.cart, {}),
    async addItem(input) { await request("cart/add", e["cart/add"], input); },
    async removeItems(keys) { await request("cart/remove", e["cart/remove"], { keys }); },
    async updateQuantity(key, quantity) { await request("cart/quantity", e["cart/quantity"], { key, quantity }); },
    checkout: () => request("checkout", e.checkout, {}),
    async saveAddress(type, address) { await request("checkout/address", e["checkout/address"], { type, address }); },
    async selectShipping(ids) { await request("checkout/shipping", e["checkout/shipping"], { ids }); },
    async applyCoupon(code) { await request("checkout/coupons/apply", e["checkout/coupons/apply"], { code }); },
    async removeCoupon(code) { await request("checkout/coupons/remove", e["checkout/coupons/remove"], { code }); },
    async placeOrder(input, requestId) {
      try { return await request("orders/place", e["orders/place"], { input, requestId }); }
      catch (error) {
        // Only our boundary's pre-execution rejection is definitive. Network errors,
        // authentication failures upstream and malformed successes remain unknown.
        if (error instanceof ApiError && (
          (error.apiCode === "validation" && [0, 400, 413].includes(error.status)) ||
          (error.apiCode === "forbidden" && [403, 415].includes(error.status)) ||
          (error.apiCode === "rate_limit" && error.status === 429)
        )) return { status: "rejected", message: error.message };
        throw error;
      }
    },
    checkoutAttempt: (requestId) => request("orders/status", e["orders/status"], { requestId }),
  };
}
