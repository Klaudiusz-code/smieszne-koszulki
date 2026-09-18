/** Renderuje stronę koszyka i jej metadane, delegując interakcje do widoku klienckiego. */
import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Koszyk",
  description: "Twój koszyk w sklepie Zabawne Koszulki.",
  path: "/koszyk",
  noIndex: true,
});

export { default } from "./CartView";
