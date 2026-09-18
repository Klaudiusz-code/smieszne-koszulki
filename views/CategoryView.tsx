import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/views/ShopView/ShopView";
import { getShopViewData, getCategoryData } from "@/lib/server/views";
import { createSeoMetadata, getSeoDescription, stripHtml } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryData(slug);
  if (!category) return {};
  return createSeoMetadata({ title: category.name, description: getSeoDescription(category.description), path: `/kategoria/${category.slug}`, noIndex: Object.keys(await searchParams).length > 0 });
}
export default async function CategoryView({ params, searchParams }: Props) {
  const { slug } = await params;
  const filters = await searchParams;
  const data = await getShopViewData(filters, slug);
  if (!data?.category) notFound();
  const { category } = data;
  return <ShopView key={JSON.stringify([slug, filters])} initial={data.initial} options={data.filters} taxonomyFilters={data.filters.taxonomyFilters} attrTerms={data.attrTerms} categoryId={category.databaseId} category={{ name: category.name, description: stripHtml(category.description || "") }} />;
}
