/** Renderuje kontrolkę zmiany sposobu sortowania produktów. */
"use client";

import { CustomSelect } from "@/components/CustomSelect/CustomSelect";
import {
  DEFAULT_PRODUCT_QUERY_OPTIONS,
  PRODUCT_SORT_OPTIONS,
  type ProductQueryOptions,
} from "@/lib/catalog-options";
import { useListingParams } from "./useListingParams";

export function ListingSortControl({ options }: { options: ProductQueryOptions }) {
  const { updateParam } = useListingParams();

  function handleSortChange(value: string) {
    updateParam(
      "sort",
      value === DEFAULT_PRODUCT_QUERY_OPTIONS.sort ? null : value,
    );
  }

  return (
    <CustomSelect
      size="sm"
      align="right"
      value={options.sort}
      options={PRODUCT_SORT_OPTIONS}
      onChange={handleSortChange}
    />
  );
}
