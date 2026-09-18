import "server-only";
import { enrichProductImages } from "@/lib/product-image-fallback";
import { AllProductCategoriesDocument as ALL_PRODUCT_CATEGORIES_QUERY } from "@/packages/commerce/woocommerce/generated";
import { AllProductsWithDescriptionsAndCategoriesDocument as ALL_PRODUCTS_WITH_DESCRIPTIONS_AND_CATEGORIES_QUERY } from "@/packages/commerce/woocommerce/generated";
import { CatalogAttributesDocument } from "./generated";
import { CategoryDocument as CATEGORY_QUERY } from "@/packages/commerce/woocommerce/generated";
import { FacetedProductsDocument as FACETED_PRODUCTS_QUERY } from "@/packages/commerce/woocommerce/generated";
import { ProductsDocument as PRODUCTS_QUERY } from "@/packages/commerce/woocommerce/generated";
import { createWooCommerceAdapter } from "@/packages/commerce/woocommerce";
import { getProductFilterVariables } from "@/packages/commerce/woocommerce/catalog";
import { taxonomyInput } from "@/packages/commerce/woocommerce/inputs";
import { type ResultOf, type VariablesOf, required } from "@/packages/commerce/woocommerce/graphql";
import type { OperationResult, OperationVariables, CommerceOperation } from "@/packages/commerce/woocommerce/documents";
import { publicQuery } from "./public-query";
import { ATTRIBUTES, PER_PAGE, DEFAULT_PRODUCT_QUERY_OPTIONS, type TermNode, type ProductQueryOptions, type TaxonomyFilter, type ProductCategoryNode, type ProductWithDescriptionsAndCategoriesNode, type ProductCategoryListNode } from "@/lib/catalog-options";
export * from "@/lib/catalog-options";

export async function fetchAttributes(): Promise<Record<string, TermNode[]>> {
  const data = await publicQuery(CatalogAttributesDocument, {});
  return {
    pa_color: (data.allPaColor?.nodes ?? []).map((term) => ({ name: required(term.name, "term.name"), slug: required(term.slug, "term.slug"), count: term.count })),
    pa_size: (data.allPaSize?.nodes ?? []).map((term) => ({ name: required(term.name, "term.name"), slug: required(term.slug, "term.slug"), count: term.count })),
  };
}
export async function fetchProducts(taxonomyFilters: TaxonomyFilter[], categoryId?: number, queryOptions: ProductQueryOptions = DEFAULT_PRODUCT_QUERY_OPTIONS) {
  const adapter = createWooCommerceAdapter(async <K extends CommerceOperation>(operation: K, variables: OperationVariables<K>) => {
    if (operation !== "Products") throw new Error("Public catalog transport only supports Products");
    // The runtime restriction narrows the selected operation; TS cannot narrow a generic K.
    const data = await publicQuery(PRODUCTS_QUERY, variables as OperationVariables<"Products">);
    return { data: data as OperationResult<K> };
  });
  const page = await adapter.products({ ...queryOptions, taxonomyFilters, categoryId, pageSize: PER_PAGE });
  return { ...page, products: await enrichProductImages(page.products) };
}
export async function fetchAllProductsWithDescriptionsAndCategories() {
  const products: ProductWithDescriptionsAndCategoriesNode[] = [];
  let found = 0;
  let after: string | null = null;
  do {
    const data: ResultOf<typeof ALL_PRODUCTS_WITH_DESCRIPTIONS_AND_CATEGORIES_QUERY> = await publicQuery(ALL_PRODUCTS_WITH_DESCRIPTIONS_AND_CATEGORIES_QUERY, { first: 100, after });
    const connection = required(data.products, "products");
    products.push(...connection.nodes.map((p) => ({ ...p, name: required(p.name, "product.name"), slug: required(p.slug, "product.slug"), productCategories: { nodes: (p.productCategories?.nodes ?? []).map(c => ({ ...c, name: required(c.name, "category.name"), slug: required(c.slug, "category.slug") })) } })));
    found = connection.found ?? found;
    const next: string | null = connection.pageInfo.hasNextPage ? required(connection.pageInfo.endCursor, "products.cursor") : null;
    if (next && next === after) throw new Error("Pagination did not advance");
    after = next;
  } while (after);
  return { products, found };
}
export async function fetchFacetedCounts(taxonomyFilters: TaxonomyFilter[], categoryId?: number, queryOptions: ProductQueryOptions = DEFAULT_PRODUCT_QUERY_OPTIONS): Promise<Record<string, Record<string, number>>> {
  const counts: Record<string, Record<string, number>> = {};
  const attrNames: Record<string, string> = Object.fromEntries(ATTRIBUTES.flatMap(a => [[a.slug, a.slug], [a.label, a.slug]]));
  let after: string | null = null;
  do {
    const variables: VariablesOf<typeof FACETED_PRODUCTS_QUERY> = { first: 100, after, categoryId: categoryId ?? null, taxonomyFilter: taxonomyFilters.length ? taxonomyInput(taxonomyFilters) : null, ...getProductFilterVariables(queryOptions) };
    // Facets are optional; retry only this read, never a mutation.
    const read = () => publicQuery(FACETED_PRODUCTS_QUERY, variables);
    const data = await read().catch(async (error: unknown) => {
      if (!(error instanceof Error) || !/502|503|504|fetch failed/i.test(error.message)) throw error;
      await new Promise(resolve => setTimeout(resolve, 250));
      return read();
    }).catch(() => null);
    if (!data) return {};
    const connection = required(data.products, "products");
    for (const product of connection.nodes) {
      for (const attribute of product.productAttributes?.nodes ?? []) {
        const slug = attribute.name ? attrNames[attribute.name] : undefined;
        if (!slug) continue;
        counts[slug] ??= {};
        for (const option of attribute.options ?? []) if (option) counts[slug][option] = (counts[slug][option] ?? 0) + 1;
      }
    }
    const next: string | null = connection.pageInfo.hasNextPage ? required(connection.pageInfo.endCursor, "products.cursor") : null;
    if (next && next === after) throw new Error("Pagination did not advance");
    after = next;
  } while (after);
  return counts;
}
export async function fetchCategory(slug: string): Promise<ProductCategoryNode | null> {
  const { productCategory: category } = await publicQuery(CATEGORY_QUERY, { slug });
  return category ? { databaseId: category.databaseId, name: required(category.name, "category.name"), slug: required(category.slug, "category.slug"), description: category.description } : null;
}
export async function fetchAllProductCategories() {
  const categories: ProductCategoryListNode[] = [];
  let after: string | null = null;
  do {
    const data: ResultOf<typeof ALL_PRODUCT_CATEGORIES_QUERY> = await publicQuery(ALL_PRODUCT_CATEGORIES_QUERY, { first: 100, after });
    const connection = required(data.productCategories, "categories");
    categories.push(...connection.nodes.map(c => ({ name: required(c.name, "category.name"), slug: required(c.slug, "category.slug") })));
    const next: string | null = connection.pageInfo.hasNextPage ? required(connection.pageInfo.endCursor, "categories.cursor") : null;
    if (next && next === after) throw new Error("Pagination did not advance");
    after = next;
  } while (after);
  return categories;
}
