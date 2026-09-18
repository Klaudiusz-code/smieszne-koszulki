import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Keep the initial browser render consistent with the server's checkout placeholders. */
export function useHasHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
