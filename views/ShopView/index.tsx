import type { Metadata } from "next";
import { ShopView } from "./ShopView";
import { getShopViewData } from "@/lib/server/views";
import { createSeoMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

type Params = Record<string, string | string[] | undefined>;
export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const params = await searchParams;
  return createSeoMetadata({ title: "Sklep", description: "Koszulki, bluzy, kubki i gadżety z oryginalnymi nadrukami.", path: "/produkty", noIndex: Object.keys(params).length > 0 });
}

export default async function Shop({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const data = await getShopViewData(params);
  if (!data) notFound();
  return <ShopView key={JSON.stringify(params)} initial={data.initial} options={data.filters} taxonomyFilters={data.filters.taxonomyFilters} attrTerms={data.attrTerms} categoryId={data.filters.categoryId} selectedCategory={data.selectedCategory} />;
}
