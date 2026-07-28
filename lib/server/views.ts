import "server-only";
import { cache } from "react";
import * as dto from "@/lib/api/views";
import type { ProductFilters, ProductPage } from "@/packages/commerce/core/models";
import { buildAttributeTaxonomyFilters, buildProductQueryOptions, PER_PAGE } from "@/lib/catalog-options";
import { wordpressViews } from "./wordpress/views";
export interface ViewProvider {
  home(): Promise<dto.HomeViewData>;
  product(slug: string): Promise<dto.ProductViewData>;
  category(slug: string): Promise<dto.CategoryData | null>;
  products(filters: ProductFilters): Promise<ProductPage>;
  attributes(): Promise<dto.ShopViewData["attrTerms"]>;
  content(segments: string[]): Promise<dto.ContentViewData | null>;
}
/** Both SSR and HTTP use these services and exactly the same validated DTOs. */
export function createViewServices(provider: ViewProvider) {
  return {
    async home() { return dto.homeView.parse(await provider.home()); },
    async product(slug: string) { return dto.productView.parse(await provider.product(slug)); },
    async category(slug: string) { const value = await provider.category(slug); return value ? dto.category.parse(value) : null; },
    async shop(params: dto.ViewParams, categorySlug?: string): Promise<dto.ShopViewData | null> {
      const selectedCategory = categorySlug ?? (Array.isArray(params.category) ? params.category[0] : params.category) ?? "";
      const category = selectedCategory ? await provider.category(selectedCategory) : null;
      if (selectedCategory && !category) return null;
      const filters = { ...buildProductQueryOptions(params), taxonomyFilters: buildAttributeTaxonomyFilters(params), categoryId: category?.databaseId, pageSize: PER_PAGE };
      const [initial, attrTerms] = await Promise.all([provider.products(filters), provider.attributes()]);
      return dto.shopView.parse({ initial, filters, attrTerms, category, selectedCategory });
    },
    async content(segments: string[]) { const result = await provider.content(segments); return result ? dto.content.parse(result) : null; },
  };
}
const services = createViewServices(wordpressViews);
export const getHomeViewData = cache(services.home);
export const getProductViewData = cache(services.product);
export const getCategoryData = cache(services.category);
export const getShopViewData = cache(services.shop);
export const getContentViewData = cache(services.content);
