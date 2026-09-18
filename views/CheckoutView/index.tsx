/** Renderuje stronę wieloetapowego procesu składania zamówienia. */

import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Zamówienie",
  description: "Finalizacja zamówienia w sklepie Zabawne Koszulki.",
  path: "/zamowienie",
  noIndex: true,
});

export { default } from "./CheckoutView";
