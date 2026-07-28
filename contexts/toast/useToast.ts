/** Udostępnia API globalnych powiadomień z najbliższego providera. */
"use client";

import { useContext } from "react";
import { ToastContext } from "./toastContext";

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
