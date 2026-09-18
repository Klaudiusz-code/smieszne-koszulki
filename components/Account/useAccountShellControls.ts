/**
 * Odpowiedzialność hooka:
 * - rozróżnia prezentację panelu konta jako strony lub modala,
 * - obsługuje zamykanie, klawisz Escape i blokadę przewijania,
 * - przywraca bezpieczną ścieżkę powrotu po opuszczeniu panelu.
 */
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDocumentKeyDown } from "@/hooks/useDocumentKeyDown";

export type AccountShellPresentation = "page" | "modal";

export function useAccountShellControls({
  presentation,
  onClose,
}: {
  presentation: AccountShellPresentation;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isModal = presentation === "modal";

  const getReturnToPath = useCallback(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    const savedPath = window.sessionStorage.getItem("wptest:return-to");

    if (!savedPath || !savedPath.startsWith("/") || savedPath.startsWith("/konto")) {
      return "/";
    }

    return savedPath;
  }, []);

  const closeAccount = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    router.replace(getReturnToPath());
  }, [getReturnToPath, onClose, router]);

  useBodyScrollLock(isModal);
  useDocumentKeyDown(isModal, (event) => {
    if (event.key === "Escape") {
      closeAccount();
    }
  });

  return { pathname, isModal, closeAccount };
}
