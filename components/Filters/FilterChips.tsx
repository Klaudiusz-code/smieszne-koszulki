/** Renderuje aktywne filtry jako znaczniki pozwalające usuwać pojedyncze kryteria. */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_PRODUCT_QUERY_OPTIONS,
  STOCK_FILTER_OPTIONS,
} from "@/lib/catalog-options";

interface TermNode {
  name: string;
  slug: string;
  count: number | null;
}

function formatPriceChip(minPrice: string | null, maxPrice: string | null) {
  if (minPrice && maxPrice) {
    return `${minPrice}-${maxPrice} zł`;
  }

  if (minPrice) {
    return `od ${minPrice} zł`;
  }

  if (maxPrice) {
    return `do ${maxPrice} zł`;
  }

  return null;
}

export function FilterChips({
  attrTerms,
}: {
  attrTerms: Record<string, TermNode[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active: Record<string, string[]> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith("pa_")) {
      active[key] = value.split(",").filter(Boolean);
    }
  });

  const priceLabel = formatPriceChip(
    searchParams.get("min_price"),
    searchParams.get("max_price"),
  );
  const stockValue = searchParams.get("stock");
  const stockLabel =
    stockValue && stockValue !== DEFAULT_PRODUCT_QUERY_OPTIONS.stock
      ? STOCK_FILTER_OPTIONS.find((option) => option.value === stockValue)?.label
      : null;
  const searchValue = searchParams.get("q")?.trim() ?? "";

  function getTermName(attrSlug: string, termSlug: string): string {
    const terms = attrTerms[attrSlug] ?? [];
    return terms.find((term) => term.slug === termSlug)?.name ?? termSlug;
  }

  function toggleFilter(attrSlug: string, termSlug: string) {
    const current = active[attrSlug] ?? [];
    const next = current.includes(termSlug)
      ? current.filter((slug) => slug !== termSlug)
      : [...current, termSlug];

    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    if (next.length > 0) {
      params.set(attrSlug, next.join(","));
    } else {
      params.delete(attrSlug);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function removeParams(keys: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));
    params.delete("after");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  const activeChips: { key: string; label: string; onClick: () => void }[] = [];
  for (const [attrSlug, terms] of Object.entries(active)) {
    for (const termSlug of terms) {
      activeChips.push({
        key: `${attrSlug}-${termSlug}`,
        label: getTermName(attrSlug, termSlug),
        onClick: () => toggleFilter(attrSlug, termSlug),
      });
    }
  }

  if (priceLabel) {
    activeChips.push({
      key: "price",
      label: priceLabel,
      onClick: () => removeParams(["min_price", "max_price"]),
    });
  }

  if (stockLabel) {
    activeChips.push({
      key: "stock",
      label: stockLabel,
      onClick: () => removeParams(["stock"]),
    });
  }

  if (searchValue) {
    activeChips.push({
      key: "search",
      label: `Szukaj: ${searchValue}`,
      onClick: () => removeParams(["q"]),
    });
  }

  if (activeChips.length === 0) {
    return null;
  }

  return (
    <>
      {activeChips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onClick}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#e7e5e4] bg-white px-3 text-[13px] font-medium text-cd-brown transition-colors hover:bg-[#fafaf9]"
        >
          {chip.label}
          <span className="text-cd-brown/40">×</span>
        </button>
      ))}
    </>
  );
}
