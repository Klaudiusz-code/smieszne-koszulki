import type { StockStatusEnum, ProductsOrderbyInput } from "./generated";
import type { ProductQueryOptions, ProductSort, ProductStockFilter } from "../core/models";

export function getProductFilterVariables(options: ProductQueryOptions) {
  const stockStatusByFilter: Record<ProductStockFilter, StockStatusEnum[]> = {
    all: ["IN_STOCK", "OUT_OF_STOCK", "ON_BACKORDER"],
    available: ["IN_STOCK", "ON_BACKORDER"],
    unavailable: ["OUT_OF_STOCK"],
  };

  return {
    search: options.search || null,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice,
    stockStatus: stockStatusByFilter[options.stock],
  };
}

export function getProductQueryVariables(options: ProductQueryOptions) {
  const orderbyBySort: Record<ProductSort, ProductsOrderbyInput> = {
    latest: { field: "DATE", order: "DESC" },
    price_asc: { field: "PRICE", order: "ASC" },
    price_desc: { field: "PRICE", order: "DESC" },
    name_asc: { field: "NAME", order: "ASC" },
    name_desc: { field: "NAME", order: "DESC" },
  };

  return {
    ...getProductFilterVariables(options),
    orderby: [orderbyBySort[options.sort]],
  };
}
