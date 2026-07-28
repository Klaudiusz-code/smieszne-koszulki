import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section id="oferta" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4 pb-8 border-b border-stone-100">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
              Z magazynu
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold text-black tracking-tight">
              Gotowe projekty
            </h2>
          </div>
          <Link
            href="/sklep"
            className="group inline-flex items-center gap-2 text-sm font-medium text-black border-b border-black pb-1 hover:text-[#27ae60] hover:border-[#27ae60] transition-colors w-fit"
          >
            Wszystkie produkty
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
