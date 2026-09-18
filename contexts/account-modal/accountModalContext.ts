"use client";

import { createContext } from "react";

export interface AccountModalContextValue {
  isOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;
}

export const AccountModalContext = createContext<AccountModalContextValue | null>(null);
