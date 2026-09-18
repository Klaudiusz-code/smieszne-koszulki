/** Renderuje bezpieczny widok płatności dla wskazanego zamówienia. */

import type { Metadata } from "next";
import OrderPayView from "./OrderPayView";
import { createSeoMetadata } from "@/lib/seo";

type Params = { orderId: string };
type SearchParams = { key?: string | string[] };

export const metadata: Metadata = createSeoMetadata({
  title: "Zapłać za zamówienie",
  description: "Dokończ płatność za zamówienie.",
  path: "/zamowienie/order-pay",
  noIndex: true,
});

export default async function OrderPay({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { orderId } = await params;
  const { key } = await searchParams;
  const orderKey = Array.isArray(key) ? key[0] : key;

  return <OrderPayView orderId={orderId} orderKey={orderKey} />;
}
