import { createAttemptRepository, createCommerceStore } from "@/packages/commerce/core";
import { createHttpCommerceAdapter } from "@/packages/commerce/http";
import { apiRequest } from "@/lib/api/client";

// Access browser storage only when used, never while rendering on the server.
export const checkoutAttempts = createAttemptRepository({
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key),
}, "store");

export function createBrowserStore() {
  return createCommerceStore(createHttpCommerceAdapter(apiRequest), checkoutAttempts, () => crypto.randomUUID());
}

export async function checkCheckoutAvailability() {
  const response = await fetch("/api/checkout-status", { cache: "no-store" });
  if (!response.ok) return false;
  return (await response.json()).available === true;
}
