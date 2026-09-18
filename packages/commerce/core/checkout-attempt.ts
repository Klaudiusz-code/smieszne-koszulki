import { CommerceError } from "./errors";
import type { CheckoutResult, CommerceAdapter, ConfirmedOrder, PlaceOrderInput } from "./models";
import { createWriteGate } from "./resource";

export interface AttemptStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export function createAttemptRepository(storage: AttemptStorage, namespace: string) {
  const attemptKey = `${namespace}:checkout-attempt`;
  const completedKey = `${namespace}:checkout-completed-order`;
  return {
    current: () => storage.getItem(attemptKey),
    begin(id: string) { storage.setItem(attemptKey, id); },
    reject() { storage.removeItem(attemptKey); storage.removeItem(completedKey); },
    complete(order: ConfirmedOrder) { storage.setItem(completedKey, String(order.orderId)); },
    acknowledge(orderId: number) {
      if (storage.getItem(completedKey) !== String(orderId)) return;
      storage.removeItem(attemptKey);
      storage.removeItem(completedKey);
    },
  };
}
export type AttemptRepository = ReturnType<typeof createAttemptRepository>;

/** Unknown outcomes remain persisted. Recovery is a read, never a second submission. */
export function createCheckoutAttempt(
  adapter: Pick<CommerceAdapter, "placeOrder" | "checkoutAttempt">,
  repository: AttemptRepository,
  createId: () => string,
  gate = createWriteGate(),
) {
  let locked = false;
  function accept(result: CheckoutResult) {
    if (result.status === "rejected") repository.reject();
    if (result.status === "completed") repository.complete(result);
    return result;
  }
  async function run(operation: () => Promise<CheckoutResult>) {
    if (locked) throw new CommerceError("busy", "Checkout operation in progress");
    const release = gate.acquire();
    locked = true;
    try { return accept(await operation()); }
    finally { locked = false; release(); }
  }
  return {
    current: repository.current,
    submit(input: PlaceOrderInput) {
      return run(async () => {
        let requestId: string;
        try {
          if (repository.current()) throw new CommerceError("pending", "Recover the previous attempt first");
          requestId = createId();
          repository.begin(requestId);
        } catch (cause) {
          if (cause instanceof CommerceError) throw cause;
          throw new CommerceError("storage", "Cannot persist checkout attempt", { cause });
        }
        return adapter.placeOrder(input, requestId);
      });
    },
    recover() {
      return run(async () => {
        const id = repository.current();
        if (!id) throw new CommerceError("pending", "No checkout attempt to recover");
        return adapter.checkoutAttempt(id);
      });
    },
  };
}
