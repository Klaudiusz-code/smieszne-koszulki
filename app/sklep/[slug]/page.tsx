import { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/lib/data";
import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || !product.category) notFound();

  const related = products
    .filter(
      (p) => p.id !== product.id && p.category?.id === product.category?.id,
    )
    .slice(0, 4);

  // Przekazujemy czyste dane do komponentu klienta
  return <ProductDetail product={product} related={related} />;
}
