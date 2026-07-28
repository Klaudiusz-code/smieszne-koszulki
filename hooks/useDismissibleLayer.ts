/** Obsługuje zamknięcie warstwy po kliknięciu poza nią lub użyciu klawisza Escape. */
import { useEffect, useRef, type RefObject } from "react";

type PointerDismissEvent = "mousedown" | "pointerdown";

interface DismissibleLayerOptions<T extends HTMLElement> {
  ref: RefObject<T | null>;
  enabled: boolean;
  onDismiss: () => void;
  pointerEvent?: PointerDismissEvent;
  closeOnEscape?: boolean;
}

export function useDismissibleLayer<T extends HTMLElement>({
  ref,
  enabled,
  onDismiss,
  pointerEvent = "pointerdown",
  closeOnEscape = true,
}: DismissibleLayerOptions<T>) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePointerDown(event: MouseEvent | PointerEvent) {
      if (ref.current?.contains(event.target as Node)) {
        return;
      }
      onDismissRef.current();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismissRef.current();
      }
    }

    document.addEventListener(pointerEvent, handlePointerDown);
    if (closeOnEscape) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener(pointerEvent, handlePointerDown);
      if (closeOnEscape) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [closeOnEscape, enabled, pointerEvent, ref]);
}
