import "server-only";
import type { ViewProvider } from "../views";
import type { ProductData } from "@/types/product";
import type { ProductWire } from "./product-page-data";
import { homeView, productView, productDetails, content } from "@/lib/api/views";
import { publicQuery } from "./public-query";
import { enrichProductImages } from "@/lib/product-image-fallback";
import { GetFrontPageProductsDocument as FRONT_PAGE_PRODUCTS_QUERY } from "@/lib/server/wordpress/generated";
import { GetPageDocument as PAGE_QUERY } from "@/lib/server/wordpress/generated";
import { GetPostDocument as POST_QUERY } from "@/lib/server/wordpress/generated";
import { fetchAttributes, fetchCategory, fetchProducts } from "./catalog-data";
import { resolveProductRoute, getRelatedProductsForProduct } from "./product-page-data";

export function mapProduct(w: ProductWire): ProductData {
  const details = "price" in w ? w : null;
  return productDetails.parse({ type: w.__typename === "VariableProduct" ? "variable" : "simple", databaseId: w.databaseId, slug: w.slug, name: w.name,
    description: w.description ?? "", shortDescription: w.shortDescription ?? "", image: w.image,
    galleryImages: w.galleryImages?.nodes ?? [], categories: w.productCategories?.nodes ?? [],
    price: details?.price ?? undefined, regularPrice: details?.regularPrice, salePrice: details?.salePrice, onSale: details?.onSale, sku: details?.sku,
    stockStatus: details?.stockStatus, stockQuantity: details?.stockQuantity, averageRating: w.averageRating,
    attributes: (details?.allAttributes?.nodes ?? []).map((a) => ({ name: a.name, label: a.label ?? a.name, options: a.options ?? [], variation: a.variation ?? false, terms: ("terms" in a ? a.terms?.nodes : []) ?? [] })),
    variations: (("variations" in w ? w.variations?.nodes : []) ?? []).map((v) => ({ ...v, attributes: v.attributes?.nodes ?? [] })),
    reviewCount: w.reviewCount ?? undefined, reviewsAllowed: w.reviewsAllowed,
    reviews: (w.reviews?.nodes ?? []).map((r) => ({ author: r.author?.node?.name ?? "Klient", date: r.date, content: r.content })) });
}
export const wordpressViews: ViewProvider = {
  async home() {
    const data = await publicQuery(FRONT_PAGE_PRODUCTS_QUERY, {});
    return homeView.parse({ products: await enrichProductImages((data.products?.nodes ?? []).map((p) => ({ ...p, type: p.__typename === "VariableProduct" ? "variable" : "simple", categorySlugs: (p.productCategories?.nodes ?? []).map(c => c.slug) }))) });
  },
  async product(slug) {
    const { product, matchedByDatabaseId } = await resolveProductRoute(slug);
    return productView.parse({ product: product ? mapProduct(product) : null, matchedByDatabaseId, similarProducts: product ? (await getRelatedProductsForProduct(product)).map((p) => ({ ...p, type: p.__typename === "VariableProduct" ? "variable" as const : "simple" as const })) : [] });
  },
  async category(slug) { const category = await fetchCategory(slug); return category ? { ...category, description: category.description ?? null } : null; },
  products: (filters) => fetchProducts(filters.taxonomyFilters, filters.categoryId, filters),
  attributes: fetchAttributes,
  async content(segments) {
    if (segments.length !== 1 && segments.length !== 4) return null;
    if (segments.length === 1) {
      const { page } = await publicQuery(PAGE_QUERY, { slug: segments[0] }, 300);
      return page ? content.parse({ type: "page", title: page.title, content: page.content ?? "" }) : null;
    }
    const { post } = await publicQuery(POST_QUERY, { slug: segments[3] }, 300);
    return post ? content.parse({ type: "post", title: post.title, content: post.content ?? "", excerpt: post.excerpt, date: post.date, modified: post.modified, author: post.author?.node.name, image: post.featuredImage?.node }) : null;
  },
};
