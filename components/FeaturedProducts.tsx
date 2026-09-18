import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { FrontProductNode } from "@/sections/home/FrontProductsSection";

export default function FeaturedProducts({
  products,
}: {
  products: FrontProductNode[];
}) {
  const featured = products.slice(0, 4);

  return (
    <section id="oferta" className="bg-white px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col gap-4 border-b border-stone-100 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Z magazynu
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">
              Gotowe projekty
            </h2>
          </div>
          <Link
            href="/produkty"
            className="group inline-flex w-fit items-center gap-2 border-b border-black pb-1 text-sm font-medium text-black transition-colors hover:border-[#27ae60] hover:text-[#27ae60]"
          >
            Wszystkie produkty
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-8 text-center text-sm text-stone-500">
            Obecnie nie ma produktów do wyświetlenia.
          </div>
        )}
      </div>
    </section>
  );
}
