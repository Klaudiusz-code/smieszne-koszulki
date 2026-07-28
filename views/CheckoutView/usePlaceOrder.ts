import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCommerce, usePlaceOrder as useOrder } from "@/packages/commerce/react";
import type { CheckoutResult, PlaceOrderInput } from "@/packages/commerce/core";
import { checkCheckoutAvailability } from "@/lib/store/browser";
import { checkoutDestination } from "@/lib/checkout-result";

/** Store-specific copy, navigation and side effects around the reusable order hook. */
export function usePlaceOrder(onRejected: () => void) {
  const router = useRouter();
  const store = useCommerce();
  const order = useOrder(checkCheckoutAvailability);
  const [message, setMessage] = useState<string | null>(null);

  function complete(result: CheckoutResult | undefined) {
    if (!result) return;
    if (result.status === "rejected") {
      setMessage(result.message || "Sprawdź dane zamówienia.");
      onRejected();
    } else if (result.status === "pending") {
      setMessage(result.message || "Trwa sprawdzanie wyniku zamówienia.");
    } else {
      store.resetSession();
      const destination = checkoutDestination(result);
      if (destination.startsWith("/")) router.push(destination);
      else window.location.assign(destination);
    }
  }

  async function handle(input?: PlaceOrderInput) {
    setMessage(null);
    try { complete(await (input ? order.submit(input) : order.recover())); }
    catch { setMessage("Nie udało się otworzyć potwierdzenia. Sprawdź wynik zamówienia ponownie."); }
  }

  const orderError = order.error
    ? order.error.code === "storage"
      ? "Przeglądarka nie pozwala zapisać próby zamówienia. Włącz pamięć witryny i spróbuj ponownie."
      : "Nie udało się potwierdzić wyniku operacji. Sprawdź wynik poprzedniej próby przed złożeniem kolejnego zamówienia."
    : message;

  return {
    available: order.available, checking: order.checking, submitting: order.submitting,
    pendingAttempt: order.pendingAttempt, orderError,
    placeOrder: (input: PlaceOrderInput) => handle(input), checkAttempt: () => handle(),
    retryAvailability: order.retryAvailability,
  };
}
