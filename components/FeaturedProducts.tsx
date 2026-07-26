import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section id="oferta" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Najnowsze propozycje
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Świeże projekty z magazynu.
            </p>
          </div>
          <Link
            href="/sklep"
            className="hidden md:block text-sm font-bold text-green-600 hover:text-green-800 transition-colors"
          >
            Zobacz całość &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/sklep"
            className="inline-block w-full py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold uppercase hover:bg-gray-100 transition-colors"
          >
            Zobacz wszystkie produkty
          </Link>
        </div>
      </div>
    </section>
  );
}
