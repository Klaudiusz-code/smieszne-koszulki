/** Zapisuje wskazaną wartość w sessionStorage po stronie przeglądarki. */
import { useEffect } from "react";

export function useSessionStorageItem(
  key: string,
  value: string,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.sessionStorage.setItem(key, value);
  }, [enabled, key, value]);
}
