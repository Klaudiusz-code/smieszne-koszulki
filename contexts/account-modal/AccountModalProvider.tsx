/** Udostępnia aplikacji stan i operacje sterujące modalem uwierzytelniania. */
"use client";

import { useCallback, useMemo, useState } from "react";
import { AccountModalContext } from "./accountModalContext";

export function AccountModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeAccountModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openAccountModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openAccountModal,
      closeAccountModal,
    }),
    [closeAccountModal, isOpen, openAccountModal],
  );

  return (
    <AccountModalContext.Provider value={value}>
      {children}
    </AccountModalContext.Provider>
  );
}
