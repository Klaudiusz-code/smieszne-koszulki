"use client";
import { useCart } from "@/packages/commerce/react";

/** Compatibility facade: the count is derived from the shared cart. */
export function useCartCount() {
  const { count, refresh } = useCart();
  return { cartCount: count, refreshCartCount: async () => { await refresh(); } };
}
