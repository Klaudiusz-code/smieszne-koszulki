/** Synchronizuje wartość logiczną Reacta z localStorage w sposób bezpieczny dla SSR. */
import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";

const LOCAL_STORAGE_CHANGE_EVENT = "zabawnekoszulki:local-storage-change";
const memoryValues = new Map<string, boolean>();

function readLocalStorageBoolean(key: string, defaultValue: boolean) {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue !== null) {
      return storedValue === "true";
    }
  } catch {
    return memoryValues.get(key) ?? defaultValue;
  }

  return memoryValues.get(key) ?? defaultValue;
}

export function useLocalStorageBoolean(
  key: string,
  defaultValue = false,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key) {
          onStoreChange();
        }
      };

      const handleLocalChange = (event: Event) => {
        if (event instanceof CustomEvent && event.detail?.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleLocalChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleLocalChange);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => readLocalStorageBoolean(key, defaultValue),
    () => defaultValue,
  );

  const setStoredValue = useCallback<Dispatch<SetStateAction<boolean>>>(
    (nextValue) => {
      const currentValue = readLocalStorageBoolean(key, defaultValue);
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(currentValue) : nextValue;

      memoryValues.set(key, resolvedValue);

      try {
        window.localStorage.setItem(key, String(resolvedValue));
      } catch {
        // Keep the in-memory value for storage-restricted browser contexts.
      }

      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_CHANGE_EVENT, { detail: { key } }));
    },
    [defaultValue, key],
  );

  return [value, setStoredValue];
}
