/** Obsługuje klawiaturę galerii produktowej oraz blokuje przewijanie pod otwartym lightboxem. */
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDocumentKeyDown } from "@/hooks/useDocumentKeyDown";

interface ProductLightboxKeyboardOptions {
  active: boolean;
  imageCount: number;
  setLightboxIndex: Dispatch<SetStateAction<number | null>>;
  setLightboxZoom: Dispatch<SetStateAction<number>>;
}

export function useProductLightboxKeyboard({
  active,
  imageCount,
  setLightboxIndex,
  setLightboxZoom,
}: ProductLightboxKeyboardOptions) {
  useBodyScrollLock(active);

  const resetZoom = useCallback(() => setLightboxZoom(1), [setLightboxZoom]);

  useDocumentKeyDown(active, (event) => {
    if (["Escape", "ArrowLeft", "ArrowRight", "+", "=", "-"].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "Escape") {
      setLightboxIndex(null);
      resetZoom();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const direction = event.key === "ArrowLeft" ? -1 : 1;

      setLightboxIndex((currentIndex) => {
        if (currentIndex === null || imageCount === 0) {
          return currentIndex;
        }

        return (currentIndex + direction + imageCount) % imageCount;
      });
      resetZoom();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      setLightboxZoom((currentZoom) =>
        Math.min(2.5, Math.max(1, Number((currentZoom + 0.5).toFixed(1)))),
      );
    }

    if (event.key === "-") {
      setLightboxZoom((currentZoom) =>
        Math.min(2.5, Math.max(1, Number((currentZoom - 0.5).toFixed(1)))),
      );
    }
  });
}
