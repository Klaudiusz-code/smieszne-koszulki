/** Renderuje kontrolki filtrowania listingu i informację o liczbie wyników. */
"use client";

import {
  DEFAULT_PRODUCT_QUERY_OPTIONS,
  STOCK_FILTER_OPTIONS,
  type ProductQueryOptions,
  type ProductStockFilter,
} from "@/lib/catalog-options";
import { useListingParams } from "./useListingParams";
import { CustomSelect } from "@/components/CustomSelect/CustomSelect";

const PRICE_RANGE_OPTIONS = [
  { label: "Każda cena", min: null, max: null },
  { label: "do 50 zł", min: null, max: 50 },
  { label: "50–100 zł", min: 50, max: 100 },
  { label: "100–200 zł", min: 100, max: 200 },
  { label: "200–500 zł", min: 200, max: 500 },
  { label: "powyżej 500 zł", min: 500, max: null },
];

function encodePriceOption(min: number | null, max: number | null) {
  return `${min ?? ""}-${max ?? ""}`;
}

function currentPriceValue(options: ProductQueryOptions) {
  const match = PRICE_RANGE_OPTIONS.find(
    (o) => o.min === options.minPrice && o.max === options.maxPrice,
  );
  return encodePriceOption(match?.min ?? null, match?.max ?? null);
}

export function ListingFilterControls({
  options,
  variant = "toolbar",
}: {
  options: ProductQueryOptions;
  variant?: "toolbar" | "panel";
}) {
  const { pushParams, searchParams, updateParam } = useListingParams();
  const priceValue = currentPriceValue(options);

  function handlePriceChange(value: string) {
    const [minStr, maxStr] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());

    if (minStr) {
      params.set("min_price", minStr);
    } else {
      params.delete("min_price");
    }

    if (maxStr) {
      params.set("max_price", maxStr);
    } else {
      params.delete("max_price");
    }

    pushParams(params);
  }

  function handleStockChange(value: ProductStockFilter) {
    updateParam(
      "stock",
      value === DEFAULT_PRODUCT_QUERY_OPTIONS.stock ? null : value,
    );
  }

  if (variant === "panel") {
    return (
      <div className="space-y-7">
        <section>
          <h3 className="text-[15px] font-medium text-cd-brown">Cena</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PRICE_RANGE_OPTIONS.map((option) => {
              const value = encodePriceOption(option.min, option.max);
              const selected = priceValue === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handlePriceChange(value)}
                  className={`min-h-10 rounded-lg border px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    selected
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#e7e5e4] bg-white text-cd-brown/72 hover:bg-[#fafaf9]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-[15px] font-medium text-cd-brown">Dostępność</h3>
          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-[#e7e5e4] bg-white">
            {STOCK_FILTER_OPTIONS.map((option) => {
              const selected = options.stock === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleStockChange(option.value)}
                  className={`min-h-11 px-2 text-[13px] font-medium transition-colors ${
                    selected
                      ? "bg-[#171717] text-white"
                      : "text-cd-brown/68 hover:bg-[#fafaf9] hover:text-cd-brown"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <CustomSelect
        size="sm"
        value={priceValue}
        options={PRICE_RANGE_OPTIONS.map((o) => ({
          value: encodePriceOption(o.min, o.max),
          label: o.label,
        }))}
        onChange={handlePriceChange}
      />

      <div
        role="group"
        aria-label="Dostępność"
        className="inline-flex h-9 overflow-hidden rounded-lg border border-[#e7e5e4] bg-white"
      >
        {STOCK_FILTER_OPTIONS.map((option) => {
          const selected = options.stock === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => handleStockChange(option.value)}
              className={`px-3 text-[13px] font-medium transition-colors ${
                selected
                  ? "bg-[#171717] text-white"
                  : "text-cd-brown/68 hover:bg-[#fafaf9] hover:text-cd-brown"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
