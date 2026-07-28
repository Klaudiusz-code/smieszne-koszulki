/**
 * Odpowiedzialność komponentu:
 * - składa widok listingu produktów z filtrów, sortowania i siatki,
 * - prezentuje aktywne kryteria oraz liczbę wyników,
 * - udostępnia mobilny modal filtrów i przełącznik układu.
 */
"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ViewToggle } from "@/components/buttons/ViewToggle";
import { ListingFilterControls } from "@/components/ListingControls/ListingFilterControls";
import { ListingSortControl } from "@/components/ListingControls/ListingSortControl";
import { FilterChips } from "@/components/Filters/FilterChips";
import { Filters } from "@/components/Filters/Filters";
import { ProductGrid } from "@/components/ProductGrid/ProductGrid";
import { FilterIcon } from "@/components/icons/FilterIcon";
import { MobileFiltersModal } from "@/components/modals/MobileFiltersModal/MobileFiltersModal";
import {
  DEFAULT_PRODUCT_QUERY_OPTIONS,
  type ProductNode,
  type ProductQueryOptions,
  type TaxonomyFilter,
  type TermNode,
} from "@/lib/catalog-options";

const LISTING_FILTER_KEYS = ["q", "min_price", "max_price", "stock"];

export function ProductListingView({
  heading,
  initialProducts,
  initialEndCursor,
  initialHasNextPage,
  taxonomyFilters,
  productQueryOptions,
  categoryId,
  attributes,
  attrTerms,
  facetedCounts,
}: {
  heading: ReactNode;
  initialProducts: ProductNode[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  taxonomyFilters: TaxonomyFilter[];
  productQueryOptions: ProductQueryOptions;
  categoryId?: number | null;
  attributes: { label: string; slug: string }[];
  attrTerms: Record<string, TermNode[]>;
  facetedCounts: Record<string, Record<string, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isGrid = searchParams.get("view") !== "list";

  function handleViewToggle() {
    const params = new URLSearchParams(searchParams.toString());

    if (isGrid) {
      params.set("view", "list");
    } else {
      params.delete("view");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleClearFilters() {
    const params = new URLSearchParams(searchParams.toString());

    searchParams.forEach((_, key) => {
      if (key.startsWith("pa_") || LISTING_FILTER_KEYS.includes(key)) {
        params.delete(key);
      }
    });
    params.delete("after");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      {heading}
      <div className="mt-6 hidden flex-wrap items-center justify-between gap-2 lg:flex">
        <div className="flex flex-wrap items-center gap-2">
          <Filters
            attributes={attributes}
            attrTerms={attrTerms}
            facetedCounts={facetedCounts}
          />
          <ListingFilterControls options={productQueryOptions} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ListingSortControl options={productQueryOptions} />
          <ViewToggle isGrid={isGrid} onClick={handleViewToggle} />
        </div>
      </div>
      <MobileListingControls
        attributes={attributes}
        attrTerms={attrTerms}
        facetedCounts={facetedCounts}
        productQueryOptions={productQueryOptions}
        isGrid={isGrid}
        onViewToggle={handleViewToggle}
        onClearFilters={handleClearFilters}
      />
      <div className="mt-[28px]">
        <ProductGrid
          initialProducts={initialProducts}
          initialEndCursor={initialEndCursor}
          initialHasNextPage={initialHasNextPage}
          taxonomyFilters={taxonomyFilters}
          productQueryOptions={productQueryOptions}
          categoryId={categoryId}
        />
      </div>
    </>
  );
}

function MobileListingControls({
  attributes,
  attrTerms,
  facetedCounts,
  productQueryOptions,
  isGrid,
  onViewToggle,
  onClearFilters,
}: {
  attributes: { label: string; slug: string }[];
  attrTerms: Record<string, TermNode[]>;
  facetedCounts: Record<string, Record<string, number>>;
  productQueryOptions: ProductQueryOptions;
  isGrid: boolean;
  onViewToggle: () => void;
  onClearFilters: () => void;
}) {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  let attributeFilterCount = 0;

  searchParams.forEach((value, key) => {
    if (key.startsWith("pa_")) {
      attributeFilterCount += value.split(",").filter(Boolean).length;
    }
  });

  const listingFilterCount =
    (productQueryOptions.search ? 1 : 0) +
    (productQueryOptions.minPrice !== null || productQueryOptions.maxPrice !== null ? 1 : 0) +
    (productQueryOptions.stock !== DEFAULT_PRODUCT_QUERY_OPTIONS.stock ? 1 : 0);
  const activeFilterCount = attributeFilterCount + listingFilterCount;

  return (
    <div className="mt-5 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-3 text-[14px] font-medium text-cd-brown shadow-[0_8px_18px_rgba(78,52,46,0.06)] transition-colors hover:bg-[#fafaf9]"
        >
          <FilterIcon className="h-4 w-4 shrink-0 text-cd-brown/62" />
          <span>Filtry</span>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#171717] px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <ListingSortControl options={productQueryOptions} />
        <ViewToggle isGrid={isGrid} onClick={onViewToggle} />
      </div>

      {activeFilterCount > 0 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterChips attrTerms={attrTerms} />
        </div>
      ) : null}

      {filtersOpen ? (
        <MobileFiltersModal
          activeFilterCount={activeFilterCount}
          attributes={attributes}
          attrTerms={attrTerms}
          facetedCounts={facetedCounts}
          productQueryOptions={productQueryOptions}
          onClearFilters={onClearFilters}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
    </div>
  );
}
