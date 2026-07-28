import type { AddCartItem, CheckoutAddress, CommerceAdapter } from "./models";
import { createResource, createWriteGate } from "./resource";
import { createCheckoutAttempt, type AttemptRepository } from "./checkout-attempt";

export function createCommerceStore(adapter: CommerceAdapter, attempts: AttemptRepository, createId: () => string) {
  const gate = createWriteGate();
  const cart = createResource(() => adapter.cart(), gate);
  const checkout = createResource(() => adapter.checkout(), gate);
  const order = createCheckoutAttempt(adapter, attempts, createId, gate);
  // A verified checkout contains a complete cart snapshot. Reuse it for all cart consumers,
  // including recovery after a temporary outage of both reads.
  checkout.subscribe(() => {
    const state = checkout.getSnapshot();
    if (state.status === "ready" && !state.action && state.data) {
      cart.accept({ items: state.data.items, subtotal: state.data.subtotal });
    }
  });
  async function changeCart(action: string, write: () => Promise<void>) {
    return cart.mutate(action, async () => {
      try { await write(); } finally { checkout.invalidate(); }
    });
  }
  async function changeCheckout(action: string, write: () => Promise<void>) {
    return checkout.mutate(action, async () => {
      try { await write(); } finally { cart.invalidate(); }
    }, { refreshOnWriteError: action === "coupon" });
  }
  return {
    adapter, cart, checkout, order,
    addItem: (input: AddCartItem) => changeCart("add", () => adapter.addItem(input)),
    removeItems: (keys: string[]) => changeCart("remove", () => adapter.removeItems(keys)),
    updateQuantity: (key: string, quantity: number) => changeCart("quantity", () => quantity < 1 ? adapter.removeItems([key]) : adapter.updateQuantity(key, quantity)),
    saveAddress: (type: "billing" | "shipping", address: Partial<CheckoutAddress>) => changeCheckout(type, () => adapter.saveAddress(type, address)),
    selectShipping: (ids: string[]) => changeCheckout("shippingMethod", () => adapter.selectShipping(ids)),
    applyCoupon: (code: string) => changeCheckout("coupon", () => adapter.applyCoupon(code)),
    removeCoupon: (code: string) => changeCheckout("coupon", () => adapter.removeCoupon(code)),
    resetSession() { cart.invalidate(); checkout.invalidate(); },
  };
}
export type CommerceStore = ReturnType<typeof createCommerceStore>;
