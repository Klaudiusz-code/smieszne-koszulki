"use client";

import { useState } from "react";
import { products, categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";

const filters = [
  { slug: "all", name: "Wszystko" },
  ...categories.map((c) => ({ slug: c.slug, name: c.name })),
];

export default function SklepPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category.slug === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <Breadcrumb items={[{ label: "Sklep" }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6 mb-10 border-b border-stone-100 pb-8">
          <div>
            <h1 className="text-4xl font-medium text-stone-900 tracking-tight">
              Kolekcja
            </h1>
            <p className="text-sm text-stone-400 font-light mt-1.5 tracking-wide">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "projekt" : "projektów"} w
              zbiorze
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.slug}
                onClick={() => setActiveFilter(f.slug)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300
                  ${
                    activeFilter === f.slug
                      ? "bg-stone-900 text-white shadow-sm shadow-stone-300"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                  }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div
          key={activeFilter}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 animate-fade-in-up"
        >
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-32 animate-fade-in-up">
            <p className="text-stone-200 text-6xl font-light mb-4">0</p>
            <p className="text-stone-400 text-sm font-light tracking-wide">
              Brak projektów w tej kategorii
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
