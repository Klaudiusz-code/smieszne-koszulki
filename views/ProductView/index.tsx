/**
 * Odpowiedzialność komponentu trasy:
 * - udostępnia konfigurację routingu i metadane produktu,
 * - obsługuje kanoniczne przekierowanie ze starego identyfikatora,
 * - składa dane strukturalne z interaktywnym widokiem produktu.
 */
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { getProductViewData } from "@/lib/server/views";
import {
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
} from "@/lib/product-page-seo";
import ProductView from "./ProductView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductViewData(slug);

  return buildProductMetadata(product, slug);
}

export default async function Product({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, matchedByDatabaseId, similarProducts } = await getProductViewData(slug);

  if (matchedByDatabaseId && product?.slug) {
    permanentRedirect(`/produkt/${product.slug}`);
  }

  if (!product) {
    notFound();
  }


  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} id="ld-product" />
      <JsonLd
        data={buildProductBreadcrumbJsonLd(product)}
        id="ld-breadcrumbs"
      />
      <ProductView product={product} similarProducts={similarProducts} />
    </>
  );
}
