/**
 * Odpowiedzialność komponentu:
 * - renderuje produkty w wybranym układzie siatki lub listy,
 * - doładowuje kolejne wyniki podczas przewijania,
 * - obsługuje dodawanie produktów do listy życzeń,
 * - prezentuje ceny, promocje i warianty kart produktów.
 */
"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { getListingPriceHtml } from "@/lib/product-price";
import { sanitizePriceHtml } from "@/lib/sanitize-html";
import { useSearchParams } from "next/navigation";
import { useLocalStorageBoolean } from "./useLocalStorageBoolean";
import { Switch } from "@/components/controls/Switch";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { PromotionBadge } from "@/components/PromotionBadge/PromotionBadge";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useIntersectionObserver } from "./useIntersectionObserver";
import { storeApi } from "@/lib/api/client";
import {
  PER_PAGE,
  type ProductNode,
  type ProductQueryOptions,
  type TaxonomyFilter,
} from "@/lib/catalog-options";

const PRODUCT_GRID_IMAGE_SIZES =
  "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
const AUTO_LOAD_STORAGE_KEY = "zabawnekoszulki:product-auto-load";



function ProductPriceMeta({ product }: { product: ProductNode }) {
  const hasStockQuantity = typeof product.stockQuantity === "number";
  const isUnavailable = product.stockStatus === "OUT_OF_STOCK";
  const stockLabel = isUnavailable
    ? "Niedostępny"
    : hasStockQuantity
      ? `${product.stockQuantity} szt. na stanie`
      : "Dostępny";
  const priceDisplay = getListingPriceHtml(product);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-black">
      {priceDisplay ? (
        <span
          className="[&_.screen-reader-text]:hidden [&_.sr-only]:hidden [&_del]:opacity-50 [&_del]:line-through [&_ins]:no-underline"
          dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(priceDisplay) }}
        />
      ) : null}
      <span className={`text-xs font-normal ${isUnavailable ? "text-[#b94040]" : "text-stone-400"}`}>
        · {stockLabel}
      </span>
    </div>
  );
}

function isProductUnavailable(product: ProductNode) {
  return product.stockStatus === "OUT_OF_STOCK";
}

export function ProductGrid({
  initialProducts,
  initialEndCursor,
  initialHasNextPage,
  taxonomyFilters,
  productQueryOptions,
  categoryId,
}: {
  initialProducts: ProductNode[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  taxonomyFilters: TaxonomyFilter[];
  productQueryOptions: ProductQueryOptions;
  categoryId?: number | null;
}) {
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const [products, setProducts] = useState<ProductNode[]>(initialProducts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [autoLoad, setAutoLoad] = useLocalStorageBoolean(AUTO_LOAD_STORAGE_KEY);
  const [nearEnd, setNearEnd] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const toggleAutoLoad = useCallback(() => {
    setAutoLoad((current) => !current);
  }, [setAutoLoad]);

  useAsyncEffect(() => {
    setProducts(initialProducts);
    setEndCursor(initialEndCursor);
    setHasNextPage(initialHasNextPage);
  }, [initialProducts, initialEndCursor, initialHasNextPage]);

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage || !endCursor) return;
    setLoading(true);
    setLoadError(false);
    try {
      const page = await storeApi("products/search", {
        filters: { ...productQueryOptions, pageSize: PER_PAGE, categoryId: categoryId ?? undefined, taxonomyFilters }, after: endCursor,
      });
      setProducts((prev) => [...prev, ...page.products]);
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
    } catch {
      setLoadError(true);
      setAutoLoad(false);
    } finally {
      setLoading(false);
    }
  }, [categoryId, loading, hasNextPage, endCursor, taxonomyFilters, productQueryOptions, setAutoLoad]);

  useIntersectionObserver(
    sentinelRef,
    autoLoad && hasNextPage,
    (entry) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    },
    { rootMargin: "400px" },
  );

  useAsyncEffect(() => {
    if (autoLoad || !hasNextPage) {
      setNearEnd(false);
    }
  }, [autoLoad, hasNextPage]);

  useIntersectionObserver(
    endRef,
    !autoLoad && hasNextPage,
    (entry) => setNearEnd(entry.isIntersecting),
    { rootMargin: "200px" },
  );

  return (
    <div className="relative">
      {products.length === 0 ? (
        <div className="bg-[#fafaf9] border border-[#e7e5e4] rounded-lg p-8 text-center">
          <p className="text-[#171717]/60">Brak produktów dla wybranych filtrów.</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, index) => {
                const unavailable = isProductUnavailable(p);
                const shouldLoadEagerly = index < 3;

                return (
                  <div
                    key={p.id}
                    className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white transition-all duration-500 hover:-translate-y-0.5 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-200/40 ${
                      unavailable ? "text-cd-brown/45" : "text-cd-brown"
                    }`}
                  >
                    <div
                      className={`relative aspect-[4/5] overflow-hidden ${
                        unavailable ? "bg-[#F1EFED]" : "bg-[#fafaf9]"
                      } ${!p.image?.sourceUrl ? "ring-2 ring-[#e7e5e4]/30" : ""}`}
                    >
                      <Link href={`/produkt/${p.slug}`} className="relative block h-full w-full" aria-label={p.name}>
                        <ProductThumbnail
                          src={p.image?.sourceUrl}
                          alt={p.image?.altText || p.name}
                          sizes={PRODUCT_GRID_IMAGE_SIZES}
                          loading={shouldLoadEagerly ? "eager" : "lazy"}
                          preload={index === 0}
                          imageClassName={`transition duration-700 ${
                            unavailable ? "grayscale opacity-45" : "group-hover:scale-105"
                          }`}
                        />
                      </Link>
                      {p.onSale && <PromotionBadge />}
                    </div>
                    <Link href={`/produkt/${p.slug}`} className="flex flex-grow flex-col p-5 pt-4">
                      <div
                        className={`mb-4 line-clamp-2 text-sm font-medium leading-snug tracking-tight ${
                          unavailable ? "text-cd-brown/48" : "text-cd-brown"
                        }`}
                      >
                        {p.name}
                      </div>
                      <div className="mt-auto border-t border-stone-100 pt-4 text-base">
                        <ProductPriceMeta product={p} />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {products.map((p, index) => {
                const unavailable = isProductUnavailable(p);
                const shouldLoadEagerly = index < 2;

                return (
                  <Link
                    key={p.id}
                    href={`/produkt/${p.slug}`}
                    className={`group flex flex-row items-start gap-5 ${
                      unavailable ? "text-cd-brown/45" : "text-cd-brown"
                    }`}
                  >
                    <div
                      className={`relative aspect-square w-[100px] shrink-0 overflow-hidden rounded-[12px] sm:w-[120px] ${
                        unavailable ? "bg-[#F1EFED]" : "bg-[#fafaf9]"
                      } ${!p.image?.sourceUrl ? "ring-2 ring-[#e7e5e4]/30" : ""}`}
                    >
                      <ProductThumbnail
                        src={p.image?.sourceUrl}
                        alt={p.image?.altText || p.name}
                        sizes="120px"
                        loading={shouldLoadEagerly ? "eager" : "lazy"}
                        preload={index === 0}
                        placeholderIconClassName="h-6 w-6 text-[#B8AAA2]"
                        imageClassName={`transition duration-500 ${
                          unavailable ? "grayscale opacity-45" : "group-hover:scale-[1.02]"
                        }`}
                      />
                      {p.onSale && (
                        <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cd-dark text-[11px] text-white">
                          %
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`text-[20px] font-medium leading-tight ${
                          unavailable ? "text-cd-brown/48" : "text-cd-brown"
                        }`}
                      >
                        {p.name}
                      </div>
                      <div className="text-[16px]">
                        <ProductPriceMeta product={p} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {loadError && <p role="alert">Nie udało się pobrać produktów. <button type="button" onClick={loadMore}>Spróbuj ponownie</button></p>}

          {hasNextPage && (
            <>
              {autoLoad && <div ref={sentinelRef} className="h-[50vh]" />}
              {!autoLoad && <div ref={endRef} className="h-1" />}

              <div className="sticky bottom-4 z-50 flex justify-center pointer-events-none mt-4">
                <div className={`pointer-events-auto flex items-stretch relative rounded-lg p-[2px] shadow-lg transition-colors ${
                  loading ? "animate-[border-spin_1.2s_linear_infinite] bg-[length:200%_200%] bg-[linear-gradient(90deg,#e7e5e4_0%,#66BB6A_35%,#2E7D32_65%,#e7e5e4_100%)]" : "bg-[#e7e5e4]"
                }`}>
                  <div className={`overflow-hidden flex transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    !autoLoad && nearEnd && !loading ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                  }`}>
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loading || autoLoad}
                      className="px-5 bg-[#171717] hover:bg-[#000000] text-white rounded-l-[6px] text-sm font-medium whitespace-nowrap"
                    >
                      Doładuj
                    </button>
                  </div>

                  <div className={`flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 ${
                    !autoLoad && nearEnd && !loading ? "rounded-r-[6px]" : "rounded-[6px]"
                  }`}>
                    <div className="flex items-center gap-2 text-sm text-[#171717]/70">
                      <span>Automatyczne doładowywanie</span>
                      <Switch
                        checked={autoLoad}
                        label="Automatyczne doładowywanie"
                        onChange={toggleAutoLoad}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
