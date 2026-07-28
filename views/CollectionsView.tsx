/** Renderuje stronę zbiorczą kolekcji wraz z metadanymi SEO. */
import type { Metadata } from "next";
import { CategoryHubView } from "@/views/CategoryHubView";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Kategorie",
  description:
    "Znajdź zabawne koszulki, bluzy, czapki, kubki i gadżety z nadrukiem.",
  path: "/kolekcje",
});

const CARDS = [
  {
    title: "Koszulki",
    description: "Klasyczne T-shirty z nadrukami, które od razu poprawiają humor.",
    href: "/kategoria/koszulki",
  },
  {
    title: "Bluzy",
    description: "Wygodne bluzy z charakterem na chłodniejsze dni.",
    href: "/kategoria/bluza",
  },
  {
    title: "Czapki",
    description: "Czapki z zabawnym detalem i wyrazistym nadrukiem.",
    href: "/kategoria/czapki",
  },
  {
    title: "Kubki",
    description: "Kubki, z którymi nawet poniedziałkowa kawa smakuje lepiej.",
    href: "/kategoria/kubki",
  },
  {
    title: "Gadżety",
    description: "Drobne upominki i zestawy dla fanów dobrego humoru.",
    href: "/kategoria/gadzety",
  },
];

export default function CollectionsView() {
  return (
    <CategoryHubView
      title="Znajdź coś dla siebie"
      description="Wybierz kategorię i odkryj nadruki na każdą okazję — od odzieży po kubki i gadżety."
      cards={CARDS}
    />
  );
}
