/** Renderuje statyczną stronę kontaktową wraz z metadanymi SEO. */
import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Kontakt",
  description: "Skontaktuj się z Zabawne Koszulki w sprawie zamówień, produktów, rozmiarów i nadruków.",
  path: "/kontakt",
});

export { ContactView as default } from "./ContactView";
