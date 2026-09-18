"use client";

import { createContext } from "react";

export interface ToastContextValue {
  showToast: (message: string, anchorEl?: HTMLElement, variant?: "add" | "remove") => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
