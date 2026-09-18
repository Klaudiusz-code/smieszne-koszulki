export interface TermNode {
  name: string;
  slug: string;
  count: number | null;
}

export interface ProductNode {
  type?: "simple" | "variable";
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText?: string | null } | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  productCategories?: { nodes: { slug: string }[] } | null;
}

export interface ProductListCategoryNode {
  databaseId: number;
  name: string;
  slug: string;
}

export interface ProductWithDescriptionsAndCategoriesNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  productCategories: {
    nodes: ProductListCategoryNode[];
  };
}

export interface AttributeDef {
  label: string;
  slug: string;
  taxonomy: string;
  queryField: string;
}

export interface ProductCategoryNode {
  databaseId: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ProductCategoryListNode {
  name: string;
  slug: string;
}

export interface TaxonomyFilter {
  taxonomy: string;
  terms: string[];
}

export type { ProductSort, ProductStockFilter, ProductQueryOptions } from "@/packages/commerce/core/models";
import type { ProductSort, ProductStockFilter, ProductQueryOptions } from "@/packages/commerce/core/models";

export const PER_PAGE = 24;

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "latest", label: "Najnowsze" },
  { value: "price_asc", label: "Cena rosnąco" },
  { value: "price_desc", label: "Cena malejąco" },
  { value: "name_asc", label: "Nazwa A-Z" },
  { value: "name_desc", label: "Nazwa Z-A" },
];

export const STOCK_FILTER_OPTIONS: { value: ProductStockFilter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "available", label: "Dostępne" },
  { value: "unavailable", label: "Niedostępne" },
];

export const DEFAULT_PRODUCT_QUERY_OPTIONS: ProductQueryOptions = {
  search: "",
  sort: "latest",
  minPrice: null,
  maxPrice: null,
  stock: "all",
};

export const ATTRIBUTES: AttributeDef[] = [
  { label: "Kolor", slug: "pa_color", taxonomy: "PA_COLOR", queryField: "allPaColor" },
  { label: "Rozmiar", slug: "pa_size", taxonomy: "PA_SIZE", queryField: "allPaSize" },
];

export function formatResultsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (count === 1) return "wynik";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return "wyniki";
  }

  return "wyników";
}

export function buildAttributeTaxonomyFilters(params: Record<string, string | string[] | undefined>) {
  const taxonomyFilters: TaxonomyFilter[] = [];

  for (const attribute of ATTRIBUTES) {
    const rawValue = params[attribute.slug];
    const terms = (Array.isArray(rawValue) ? rawValue : [rawValue])
      .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
      .filter(Boolean);

    if (terms.length) taxonomyFilters.push({ taxonomy: attribute.taxonomy, terms: [...new Set(terms)] });
  }

  return taxonomyFilters;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePriceParam(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function buildProductQueryOptions(
  params: Record<string, string | string[] | undefined>,
): ProductQueryOptions {
  const sortParam = getParam(params, "sort");
  const stockParam = getParam(params, "stock");
  const sort = PRODUCT_SORT_OPTIONS.some((option) => option.value === sortParam)
    ? (sortParam as ProductSort)
    : DEFAULT_PRODUCT_QUERY_OPTIONS.sort;
  const stock = STOCK_FILTER_OPTIONS.some((option) => option.value === stockParam)
    ? (stockParam as ProductStockFilter)
    : DEFAULT_PRODUCT_QUERY_OPTIONS.stock;

  return {
    search: (getParam(params, "q") ?? "").trim(),
    sort,
    minPrice: parsePriceParam(getParam(params, "min_price")),
    maxPrice: parsePriceParam(getParam(params, "max_price")),
    stock,
  };
}

export function hasProductQueryFilters(options: ProductQueryOptions) {
  return Boolean(
    options.search ||
      options.minPrice !== null ||
      options.maxPrice !== null ||
      options.stock !== DEFAULT_PRODUCT_QUERY_OPTIONS.stock,
  );
}
