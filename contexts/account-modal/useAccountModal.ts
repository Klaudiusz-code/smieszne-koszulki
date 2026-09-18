/** Udostępnia stan i operacje modala konta z najbliższego providera. */
"use client";

import { useContext } from "react";
import { AccountModalContext } from "./accountModalContext";

export function useAccountModal() {
  const context = useContext(AccountModalContext);

  if (!context) {
    throw new Error("useAccountModal must be used within AccountModalProvider");
  }

  return context;
}
