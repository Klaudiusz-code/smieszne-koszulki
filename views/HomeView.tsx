/**
 * Odpowiedzialność komponentu strony głównej:
 * - pobiera wyróżnione produkty potrzebne na stronie startowej,
 * - generuje metadane i dane strukturalne strony,
 * - renderuje sekcje strony głównej.
 */
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { getHomeViewData } from "@/lib/server/views";
import { absoluteUrl, createSeoMetadata } from "@/lib/seo";
import HeroSection from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import ProcessSection from "@/components/ProcessSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyUsSection from "@/components/WhyUsSection";
import MaterialsSection from "@/components/MaterialsSection";
import ContactSection from "@/components/ContactSection";


export const metadata: Metadata = createSeoMetadata({
  title: "Koszulki i gadżety z dobrym humorem",
  description:
    "Odkryj zabawne koszulki, bluzy, kubki, czapki i gadżety z oryginalnymi nadrukami.",
  path: "/",
});

export default async function HomeView() {
  const { products } = await getHomeViewData();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Najnowsze produkty",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/produkt/${product.slug}/`),
      name: product.name,
    })),
  };

  return (
    <>
      {products.length > 0 ? (
        <JsonLd data={itemList} id="ld-home-products" />
      ) : null}
      <HeroSection />
      <CategoryCards />
      <FeaturedProducts products={products} />
      <ProcessSection />
      <WhyUsSection />
      <MaterialsSection />
      <ContactSection />
    </>
  );
}
