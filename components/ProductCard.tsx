import Link from "next/link";
import { ProductThumbnail } from "@/components/ProductThumbnail/ProductThumbnail";
import { getListingPriceHtml } from "@/lib/product-price";
import { sanitizePriceHtml } from "@/lib/sanitize-html";

export interface StoreCardProduct {
  type?: "simple" | "variable";
  id: string;
  databaseId: number;
  name: string;
  slug?: string | null;
  image: { sourceUrl: string; altText?: string | null } | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
  stockStatus?: string | null;
  categorySlugs?: string[];
  productCategories?: { nodes: { slug: string }[] } | null;
}

const categoryNames: Record<string, string> = {
  koszulki: "Koszulki",
  bluza: "Bluzy",
  kubki: "Kubki",
  czapki: "Czapki",
  gadzety: "Gadżety",
};

export default function ProductCard({
  product,
}: {
  product: StoreCardProduct;
}) {
  const categorySlug = product.categorySlugs?.[0] ?? product.productCategories?.nodes[0]?.slug;
  const categoryName = categorySlug
    ? categoryNames[categorySlug] || "Produkty"
    : "Produkty";
  const price = getListingPriceHtml(product);
  const href = `/produkt/${product.slug || product.databaseId}`;
  const unavailable = product.stockStatus === "OUT_OF_STOCK";

  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full flex-col rounded-2xl bg-white p-3 transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-stone-300/50">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-50">
          <ProductThumbnail
            src={product.image?.sourceUrl}
            alt={product.image?.altText || product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            imageClassName={`transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
              unavailable ? "grayscale opacity-50" : ""
            }`}
          />

          {product.onSale ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black backdrop-blur-sm">
              Promocja
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 items-start justify-between gap-4 pb-1 pt-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium leading-snug tracking-tight text-stone-900">
              {product.name}
            </h3>
            <p className="mt-1 text-[11px] tracking-wide text-stone-400">
              {categoryName}
            </p>
          </div>

          <div className="mt-0.5 shrink-0 text-right">
            {price ? (
              <span
                className="text-sm font-semibold tracking-tight text-stone-900 [&_.screen-reader-text]:hidden [&_.sr-only]:hidden [&_del]:block [&_del]:mt-0.5 [&_del]:text-[11px] [&_del]:font-normal [&_del]:text-stone-400 [&_del]:line-through [&_ins]:no-underline"
                dangerouslySetInnerHTML={{ __html: sanitizePriceHtml(price) }}
              />
            ) : (
              <span className="text-xs text-stone-400">Sprawdź cenę</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
