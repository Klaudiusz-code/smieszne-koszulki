import "server-only";
import { enrichProductImages } from "@/lib/product-image-fallback";
import { GetProductDocument as PRODUCT_QUERY } from "@/lib/server/wordpress/generated";
import { ProductSlugsDocument as PRODUCT_SLUGS_QUERY } from "@/lib/server/wordpress/generated";
import { RelatedProductsDocument as RELATED_PRODUCTS_QUERY } from "@/lib/server/wordpress/generated";
import { type ResultOf, required } from "@/packages/commerce/woocommerce/graphql";
import type { GetProductQuery, ProductIdTypeEnum } from "./generated";
import { publicQuery } from "./public-query";
export type ProductWire = NonNullable<GetProductQuery["product"]>;

export async function getProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let after: string | null = null;
  try {
    do {
      const data: ResultOf<typeof PRODUCT_SLUGS_QUERY> = await publicQuery(PRODUCT_SLUGS_QUERY, { first: 100, after }, 3600);
      const products = required(data.products, "products");
      for (const product of products.nodes) if (product.slug) slugs.push(product.slug);
      const next: string | null = products.pageInfo.hasNextPage ? required(products.pageInfo.endCursor, "products.cursor") : null;
      if (next && next === after) throw new Error("Pagination did not advance");
      after = next;
    } while (after);
  } catch (error) { console.error("Failed to fetch product slugs.", error); }
  return slugs;
}
async function getProduct(id: string, idType: ProductIdTypeEnum): Promise<ProductWire | null> {
  const { product } = await publicQuery(PRODUCT_QUERY, { id, idType }, 1);
  if (!product) return null;
  if (product.image?.sourceUrl) return product;
  const [enriched] = await enrichProductImages([product], { sourceSize: "full" });
  return enriched;
}
export async function resolveProductRoute(routeParam: string) {
  const product = await getProduct(routeParam, "SLUG");
  if (product || !/^\d+$/.test(routeParam)) return { product, matchedByDatabaseId: false };
  return { product: await getProduct(routeParam, "DATABASE_ID"), matchedByDatabaseId: true };
}
export async function getRelatedProductsForProduct(product: ProductWire) {
  const categoryId = product.productCategories?.nodes[0]?.databaseId;
  if (!categoryId) return [];
  const data = await publicQuery(RELATED_PRODUCTS_QUERY, { categoryId });
  return enrichProductImages(required(data.products, "products").nodes.filter(p => p.databaseId !== product.databaseId).slice(0, 4));
}
