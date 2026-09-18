/** Uruchamia efekt asynchroniczny i pozwala bezpiecznie pominąć wynik po jego anulowaniu. */
import { useEffect, type DependencyList } from "react";

interface AsyncEffectControls {
  isCancelled: () => boolean;
}

type AsyncEffectCleanup = void | (() => void);
type AsyncEffectCallback = (
  controls: AsyncEffectControls,
) => AsyncEffectCleanup | Promise<AsyncEffectCleanup>;

export function useAsyncEffect(callback: AsyncEffectCallback, deps: DependencyList) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: AsyncEffectCleanup;

    void Promise.resolve(callback({ isCancelled: () => cancelled })).then((result) => {
      if (cancelled && typeof result === "function") {
        result();
        return;
      }

      cleanup = result;
    });

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
    // Custom hook call sites own the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
