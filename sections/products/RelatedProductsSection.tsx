/** Renderuje zestaw produktów powiązanych wraz ze stanami zastępczymi podczas ładowania. */
import Link from "next/link";
import ProductCard, { type StoreCardProduct } from "@/components/ProductCard";

export type RelatedProduct = StoreCardProduct;

function RelatedProductPlaceholder() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-stone-100 bg-white">
      <div className="aspect-[4/5] bg-stone-50" />
      <div className="p-5 pt-4">
        <div className="h-3 w-20 rounded bg-stone-100" />
        <div className="mt-3 h-4 w-4/5 rounded bg-stone-100" />
        <div className="mt-4 border-t border-stone-100 pt-4">
          <div className="h-5 w-1/2 rounded bg-stone-100" />
        </div>
      </div>
    </div>
  );
}

export function RelatedProductsSection({
  products,
  loading = false,
  placeholderCount = 4,
  className,
  title = "Podobne produkty",
}: {
  products: RelatedProduct[];
  loading?: boolean;
  placeholderCount?: number;
  className?: string;
  title?: string;
}) {
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:gap-4">
        <h2 className="text-3xl font-medium tracking-tight text-black md:text-4xl">{title}</h2>
        <Link
          href="/produkty"
          className="text-[17px] font-medium text-[#171717] underline underline-offset-4 transition-colors hover:text-[#ddb745]"
        >
          Zobacz wszystkie
        </Link>
      </div>

      <div className="mt-[28px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: placeholderCount }, (_, index) => (
              <RelatedProductPlaceholder key={index} />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
