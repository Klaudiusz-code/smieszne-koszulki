/** Pobiera pliki cyfrowe przypisane do zalogowanego klienta i udostępnia stan ładowania. */
import { useState } from "react";
import { storeApi } from "@/lib/api/client";
import type { Output } from "@/lib/api/contracts";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";

export type CustomerDownloadableItem = Output<"account/files">[number];

export function useCustomerDownloadableItems() {
  const [items, setItems] = useState<CustomerDownloadableItem[] | null>(null);

  const [error, setError] = useState("");

  useAsyncEffect(async ({ isCancelled }) => {
    try {
      const result = await storeApi("account/files", {});
      if (!isCancelled()) setItems(result);
    } catch { if (!isCancelled()) { setError("Nie udało się pobrać danych."); setItems([]); } }
  }, []);

  return { items, error };
}
