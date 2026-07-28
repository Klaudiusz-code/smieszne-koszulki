"use client";
import { useCart } from "@/packages/commerce/react";
export type { CartItem as ProductCartStatusItem } from "@/packages/commerce/core";

export function useProductCartStatus() {
  const { cart, refresh } = useCart();
  return { cartItems: cart?.items ?? [], refreshCartStatus: refresh };
}
