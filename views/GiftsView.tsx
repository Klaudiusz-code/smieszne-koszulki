/** Renderuje stronę kategorii prezentowych i prowadzi użytkownika do dopasowanych listingów. */
import type { Metadata } from "next";
import { CategoryHubView } from "@/views/CategoryHubView";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Pomysły na prezent",
  description:
    "Wybierz zabawną koszulkę, bluzę, kubek lub gadżet na prezent.",
  path: "/prezenty",
});

const CARDS = [
  {
    title: "Koszulki z humorem",
    description: "Prezent, który można nosić i pokazywać światu.",
    href: "/kategoria/koszulki",
  },
  {
    title: "Kubki",
    description: "Mały prezent do domu, biura i porannej kawy.",
    href: "/kategoria/kubki",
  },
  {
    title: "Gadżety",
    description: "Drobne upominki, które robią duże wrażenie.",
    href: "/kategoria/gadzety",
  },
];

export default function GiftsView() {
  return (
    <CategoryHubView
      title="Prezenty z przymrużeniem oka"
      description="Wybierz kategorię i znajdź prezent, który naprawdę zapadnie w pamięć."
      cards={CARDS}
    />
  );
}
