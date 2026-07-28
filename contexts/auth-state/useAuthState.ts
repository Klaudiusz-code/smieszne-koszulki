/** Udostępnia bieżący stan uwierzytelnienia z najbliższego providera. */
"use client";

import { useContext } from "react";
import { AuthStateContext } from "./authStateContext";

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthStateProvider");
  }

  return context;
}
