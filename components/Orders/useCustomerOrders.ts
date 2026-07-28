/** Pobiera historię zamówień klienta i udostępnia stan ładowania danych. */
import { useState } from "react";
import { storeApi } from "@/lib/api/client";
import type { Output } from "@/lib/api/contracts";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";

export type CustomerOrder = Output<"account/orders">[number];

export function useCustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);

  const [error, setError] = useState("");

  useAsyncEffect(async ({ isCancelled }) => {
    try {
      const result = await storeApi("account/orders", {});
      if (!isCancelled()) setOrders(result);
    } catch { if (!isCancelled()) { setError("Nie udało się pobrać danych."); setOrders([]); } }
  }, []);

  return { orders, error };
}
