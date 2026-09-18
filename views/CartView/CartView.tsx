/**
 * Odpowiedzialność komponentu:
 * - pobiera i prezentuje zawartość koszyka,
 * - obsługuje zmianę ilości oraz usuwanie pozycji,
 * - synchronizuje podsumowanie cen i globalny licznik koszyka,
 * - prezentuje rekomendacje oraz przejście do zamówienia.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { storeApi } from "@/lib/api/client";
import { RequestError } from "@/components/RequestError";
import { sanitizePriceHtml } from "@/lib/sanitize-html";
import { useCart } from "@/packages/commerce/react";
import type { CartItem } from "@/packages/commerce/core";
import {
  RelatedProductsSection,
  type RelatedProduct,
} from "@/sections/products/RelatedProductsSection";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { MinusIcon } from "@/components/icons/MinusIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { XIcon } from "@/components/icons/XIcon";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import Breadcrumb from "@/components/Breadcrumb";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { trackBeginCheckout } from "@/lib/gtag";

type SimilarProduct = RelatedProduct;

function formatVariantAttrs(item: CartItem): string | null {
  const varAttrs = item.variation?.attributes;
  if (!varAttrs?.length) return null;

  const labelMap: Record<string, string> = {};
  for (const a of item.product.attributes ?? []) {
    labelMap[a.name] = a.label;
  }

  return varAttrs
    .map((a) => `${labelMap[a.name] || a.name}: ${a.value}`)
    .join(" / ");
}

function PriceLoading({ className = "w-20" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-[1.05em] shrink-0 ${className} animate-pulse rounded bg-[#e7e5e4] align-middle`}
      aria-hidden="true"
    />
  );
}

function CartItemPlaceholder() {
  return (
    <div
      className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(78,52,46,0.07)] animate-pulse sm:p-5"
      aria-hidden="true"
    >
      <div className="flex gap-4 sm:gap-5">
        <div className="h-[96px] w-[96px] flex-shrink-0 rounded-xl bg-[#f5f5f4]" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 max-w-[80%] rounded bg-[#f5f5f4]" />
              <div className="h-3 w-28 max-w-[50%] rounded bg-[#f5f5f4]/70" />
            </div>
            <div className="h-7 w-7 rounded-full bg-[#f5f5f4]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-9 w-28 rounded-full bg-[#f5f5f4]" />
            <div className="h-4 w-20 rounded bg-[#f5f5f4]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimaryCategoryId(items: CartItem[]): number | null {
  const categoryCounts = new Map<number, number>();

  for (const item of items) {
    for (const categoryId of item.product.categoryIds) {
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + item.quantity);
    }
  }

  return [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function productHref(product: { databaseId: number; slug?: string | null }) {
  return `/produkt/${product.slug || product.databaseId}`;
}

export default function CartView() {
  const { cart, loading, busy: refreshing, error: cartError, refresh, removeItems, updateQuantity: changeQuantity } = useCart();
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const error = cartError ? "Nie udało się potwierdzić zawartości koszyka. Odśwież go przed kolejną zmianą." : null;
  const removeItem = (key: string) => removeItems([key]).catch(() => {});
  const updateQuantity = (key: string, quantity: number) => changeQuantity(key, quantity).catch(() => {});
  const items = cart?.items ?? [];
  const hasItems = items.length > 0;
  const pricesLoading = loading || refreshing || Boolean(error);
  const showItemPlaceholders = loading && !hasItems;
  const summarySubtotal = hasItems ? (cart?.subtotal ?? "") : "0 zł";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const similarCategoryId = getPrimaryCategoryId(items);
  const cartProductIdsKey = [...new Set(items.map((item) => item.product.databaseId))]
    .sort((a, b) => a - b)
    .join(",");
  const canLoadSimilarProducts = hasItems && Boolean(similarCategoryId);
  const showSimilarPlaceholders = loading || similarLoading;
  const showSimilarSection =
    loading ||
    (canLoadSimilarProducts && (showSimilarPlaceholders || similarProducts.length > 0));

  useAsyncEffect(async ({ isCancelled }) => {
    if (loading) {
      return;
    }

    if (!hasItems || !similarCategoryId) {
      setSimilarProducts([]);
      setSimilarLoading(false);
      return;
    }

    const excludedProductIds = new Set(
      cartProductIdsKey
        .split(",")
        .filter(Boolean)
        .map((id) => Number(id))
    );

    setSimilarLoading(true);

    try {
      const products = await storeApi("cart/recommendations", { categoryId: similarCategoryId });
      if (isCancelled()) return;
      setSimilarProducts(
        products
          .filter((product) => !excludedProductIds.has(product.databaseId))
          .slice(0, 4)
      );
    } catch {
      if (!isCancelled()) {
        setSimilarProducts([]);
      }
    } finally {
      if (!isCancelled()) {
        setSimilarLoading(false);
      }
    }
  }, [cartProductIdsKey, hasItems, loading, similarCategoryId]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumb items={[{ label: "Koszyk" }]} />

      {error && <RequestError message={error} busy={loading || refreshing} onRetry={() => { void refresh().catch(() => {}); }} />}

      {/* Header */}
      <header className="mb-10 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Koszyk
          </h1>
        </div>
        <Link
          href="/produkty"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-500 transition-colors hover:border-black hover:text-black sm:px-4 sm:text-sm"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Kontynuuj zakupy
        </Link>
      </header>

      <div
        className={
          loading || hasItems
            ? "grid gap-16 lg:grid-cols-3 lg:items-start"
            : "block"
        }
      >
        {/* Items */}
        <section className="divide-y divide-stone-100 lg:col-span-2">
          {showItemPlaceholders ? (
            [0].map((i) => <CartItemPlaceholder key={i} />)
          ) : error && !hasItems ? null : !hasItems ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#ddb745]/10">
                <svg className="h-10 w-10 text-[#ddb745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="mb-3 text-3xl font-medium tracking-tight text-black">
                Twój koszyk jest pusty
              </h2>
              <p className="mb-10 max-w-sm text-sm leading-relaxed text-stone-400">
                Nie znalazłeś nic dla siebie? Sprawdź nasze najnowsze kolekcje koszulek i gadżetów.
              </p>
              <Link
                href="/produkty"
                className="inline-flex rounded-full bg-black px-10 py-4 text-sm font-medium tracking-wide text-white transition-colors hover:bg-stone-800"
              >
                Przeglądaj produkty
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const attrs = formatVariantAttrs(item);

              return (
                <article
                  key={item.key}
                  className="group py-8 first:pt-0"
                >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <Link
                          href={productHref(item.product)}
                          className="block"
                          tabIndex={-1}
                        >
                          <div className="relative h-40 w-32 overflow-hidden rounded-2xl bg-stone-50 ring-1 ring-stone-100 transition-all duration-300 group-hover:ring-stone-300">
                            <ProductThumbnail
                              src={item.product.image?.sourceUrl}
                              alt={
                                item.product.image?.altText ||
                                item.product.name
                              }
                              sizes="128px"
                              placeholderIconClassName="h-6 w-6 text-[#B8AAA2]"
                              imageClassName="transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                          </div>
                        </Link>
                      </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      {/* Name row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={productHref(item.product)}
                            className="line-clamp-2 text-base font-medium tracking-tight text-black hover:underline hover:decoration-stone-300 hover:underline-offset-4"
                          >
                            {item.product.name}
                          </Link>
                          {attrs && (
                            <p className="mt-3 inline-flex rounded-md border border-stone-100 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500">
                              {attrs}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          disabled={refreshing || loading || Boolean(error)}
                          aria-label="Usuń z koszyka"
                          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center text-stone-300 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Stepper + Price */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 items-center overflow-hidden rounded-xl border border-stone-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            disabled={refreshing || loading || Boolean(error)}
                            aria-label="Zmniejsz ilość"
                            className={`flex h-full w-11 items-center justify-center text-lg font-light transition-colors ${
                              refreshing
                                ? "cursor-not-allowed opacity-40"
                                : "text-stone-500 hover:bg-stone-50 hover:text-black"
                            }`}
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <span className="flex h-full w-12 items-center justify-center border-x border-stone-200 text-center text-sm font-medium text-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            disabled={refreshing || loading || Boolean(error)}
                            aria-label="Zwiększ ilość"
                            className={`flex h-full w-11 items-center justify-center text-lg font-light transition-colors ${
                              refreshing
                                ? "cursor-not-allowed opacity-40"
                                : "text-stone-500 hover:bg-stone-50 hover:text-black"
                            }`}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>

                        {pricesLoading ? (
                          <PriceLoading className="w-[5rem]" />
                        ) : (
                          <span
                            className="text-base font-medium tracking-tight text-black"
                            dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(item.subtotal) }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Summary */}
        {loading || hasItems ? (
        <aside className="lg:sticky lg:top-8">
          <div className="rounded-3xl border border-stone-100 bg-stone-50 p-8">
            <h2 className="text-xl font-medium tracking-tight text-black">
              Podsumowanie
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[15px] text-[#171717]/60">
                  {loading ? "Ładowanie…" : `Produkty (${itemCount})`}
                </span>
                {pricesLoading ? (
                  <PriceLoading className="w-[5rem]" />
                ) : (
                  <span
                    className="text-[15px] font-medium text-[#171717]"
                    dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(summarySubtotal) }}
                  />
                )}
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-[#171717]/50">Dostawa</span>
                <span className="text-right text-[13px] leading-snug text-[#171717]/45">
                  Obliczana przy zamówieniu
                </span>
              </div>
            </div>

            <div className="my-6 h-px bg-stone-200" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium text-[#171717]">
                Łącznie
              </span>
              {pricesLoading ? (
                <PriceLoading className="h-[22px] w-[5.5rem]" />
              ) : (
                <span
                  className="text-[22px] font-semibold leading-none text-[#171717]"
                  dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(summarySubtotal) }}
                />
              )}
            </div>

            {pricesLoading || !hasItems ? (
              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#e7e5e4] px-6 py-4 text-sm font-medium tracking-wide text-[#171717]/40"
              >
                Przejdź do zamówienia
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/zamowienie"
                aria-disabled={pricesLoading || Boolean(error)}
                onClick={(event) => {
                  if (pricesLoading || error) { event.preventDefault(); return; }
                  trackBeginCheckout({
                  value: cart?.subtotal,
                  items: items.map((item) => ({
                    id: item.product.databaseId,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.subtotal,
                  })),
                }); }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#27ae60] px-6 py-4 text-sm font-medium tracking-wide text-white shadow-sm shadow-[#27ae60]/20 transition-colors hover:bg-[#219150]"
              >
                Przejdź do zamówienia
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}

          </div>
        </aside>
        ) : null}
      </div>

      {showSimilarSection && (
        <RelatedProductsSection
          products={similarProducts}
          loading={showSimilarPlaceholders}
        />
      )}
    </div>
  );
}
