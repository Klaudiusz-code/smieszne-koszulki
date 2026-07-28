/** Rejestruje warunkową obsługę keydown dokumentu z zawsze aktualnym callbackiem. */
import { useEffect, useRef } from "react";

export function useDocumentKeyDown(
  enabled: boolean,
  onKeyDown: (event: KeyboardEvent) => void,
) {
  const onKeyDownRef = useRef(onKeyDown);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      onKeyDownRef.current(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
