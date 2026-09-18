import type { CheckoutResult } from "@/packages/commerce/core/models";
export type { CheckoutResult } from "@/packages/commerce/core/models";

export function checkoutDestination(result: CheckoutResult) {
  if (result.status !== "completed" || !Number.isInteger(result.orderId) || result.orderId! <= 0 || !result.orderKey) {
    throw new Error("Brak potwierdzenia utworzenia zamówienia.");
  }
  // A payment redirect is supplied by the server-side gateway, never a form parameter.
  if (result.needsPayment && result.redirectUrl) {
    const url = new URL(result.redirectUrl);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Nieprawidłowy adres płatności.");
    return url.href;
  }
  const route = result.needsPayment ? "order-pay" : "order-received";
  return `/zamowienie/${route}/${result.orderId}?key=${encodeURIComponent(result.orderKey)}`;
}
