import { checkoutAttempts } from "./store/browser";
/** A receipt remains readable even when browser storage is unavailable. */
export function acknowledgeCheckoutOrder(orderId: number) {
  try { checkoutAttempts.acknowledge(orderId); } catch { /* Storage is optional for receipt display. */ }
}
