/**
 * Odpowiedzialność komponentu:
 * - prezentuje wyróżnione produkty na stronie głównej,
 * - renderuje ich ceny, zdjęcia i oznaczenia promocji,
 * - obsługuje zapisywanie produktów na liście życzeń.
 */
"use client";

import Link from "next/link";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { PromotionBadge } from "@/components/PromotionBadge/PromotionBadge";
import { getListingPriceHtml } from "@/lib/product-price";
import { sanitizePriceHtml } from "@/lib/sanitize-html";

const FRONT_PRODUCT_IMAGE_SIZES =
  "(min-width: 1536px) 432px, (min-width: 1280px) calc((100vw - 216px) / 3), (min-width: 640px) calc((100vw - 108px) / 2), calc(100vw - 40px)";

export type FrontProductNode = import("@/packages/commerce/core/models").Product;

function getStockLabel(product: FrontProductNode) {
  if (product.stockStatus === "OUT_OF_STOCK") {
    return "Niedostępny";
  }

  if (typeof product.stockQuantity === "number") {
    return `${product.stockQuantity} szt. na stanie`;
  }

  return "Dostępny";
}

export function FrontProductsSection({ products }: { products: FrontProductNode[] }) {
  return (
    <section className="my-[64px]">
      <div>
        <h1 className="flex items-baseline gap-4 text-[34px] font-medium sm:text-[36px]">
          <b>Nowości z charakterem</b>
          <Link
            href="/produkty"
            className="text-[17px] font-medium text-cd-brown underline underline-offset-4 hover:text-[#27ae60]"
          >
            Zobacz wszystkie
          </Link>
        </h1>
        <p className="mt-3 max-w-[760px] text-[18px] leading-8 text-cd-brown">
          Nadruki, które mówią za Ciebie. Znajdź koszulkę, bluzę, kubek albo gadżet
          na prezent — lub po prostu na poprawę własnego humoru.
        </p>
      </div>

      <div className="mt-[28px] flex flex-col gap-y-[48px] sm:flex-row sm:flex-wrap sm:justify-between sm:gap-y-[48px]">
        {products.map((product, index) => {
          const unavailable = product.stockStatus === "OUT_OF_STOCK";
          const shouldLoadEagerly = index < 3;
          const priceDisplay = getListingPriceHtml(product);

          return (
            <div
              key={product.id}
              className={`group flex w-full flex-col sm:w-[calc(50%-24px)] xl:w-[calc(33.333%-32px)] ${
                unavailable ? "text-cd-brown/45" : "text-cd-brown"
              }`}
            >
              <div
                className={`relative aspect-square overflow-hidden rounded-[24px] ${
                  unavailable ? "bg-[#F1EFED]" : "bg-[#fafaf9]"
                } ${!product.image?.sourceUrl ? "ring-2 ring-[#e7e5e4]/30" : ""}`}
              >
                <Link href={`/produkt/${product.slug}`} className="relative block h-full w-full" aria-label={product.name}>
                  <ProductThumbnail
                    src={product.image?.sourceUrl}
                    alt={product.image?.altText || product.name}
                    sizes={FRONT_PRODUCT_IMAGE_SIZES}
                    loading={shouldLoadEagerly ? "eager" : "lazy"}
                    preload={index < 2}
                    fetchPriority={shouldLoadEagerly ? "high" : undefined}
                    imageClassName={`transition-transform duration-500 ${
                      unavailable ? "grayscale opacity-45" : "group-hover:scale-[1.02]"
                    }`}
                  />
                </Link>

                {product.onSale && <PromotionBadge />}

              </div>

              <Link href={`/produkt/${product.slug}`} className="mt-5 flex-grow space-y-2 px-1">
                <div className={`text-[24px] font-medium leading-tight ${unavailable ? "text-cd-brown/48" : "text-cd-brown"}`}>
                  {product.name}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[18px] text-cd-brown/78">
                  {priceDisplay && (
                    <span
                      className="[&_.screen-reader-text]:hidden [&_.sr-only]:hidden [&_del]:opacity-50 [&_del]:line-through [&_ins]:no-underline"
                      dangerouslySetInnerHTML={{
                        __html: sanitizePriceHtml(priceDisplay),
                      }}
                    />
                  )}
                  {priceDisplay && (
                    <span aria-hidden="true" className="h-[3px] w-[3px] self-center rounded-full bg-cd-brown/38" />
                  )}
                  <span className={unavailable ? "text-[#b94040]" : "text-[#4a7c59]"}>
                    {getStockLabel(product)}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
