/** Renderuje stronę potwierdzającą przyjęcie wskazanego zamówienia. */

import type { Metadata } from "next";
import OrderReceivedView from "./OrderReceivedView";
import { createSeoMetadata } from "@/lib/seo";

type Params = { orderId: string };
type SearchParams = { key?: string | string[] };

export const metadata: Metadata = createSeoMetadata({
  title: "Potwierdzenie zamówienia",
  description: "Potwierdzenie złożenia zamówienia w sklepie Zabawne Koszulki.",
  path: "/zamowienie/order-received",
  noIndex: true,
});

export default async function OrderReceived({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { orderId } = await params;
  const { key } = await searchParams;
  const orderKey = Array.isArray(key) ? key[0] : key;

  return <OrderReceivedView orderId={orderId} orderKey={orderKey} />;
}
