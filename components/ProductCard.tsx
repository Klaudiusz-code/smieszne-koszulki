"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/sklep/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl p-3 transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-stone-300/50 hover:-translate-y-1.5">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-50">
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText}
            fill
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {product.onSale && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
              Sale
            </div>
          )}
        </div>

        <div className="pt-4 pb-1 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-stone-900 tracking-tight leading-snug truncate">
              {product.name}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 tracking-wide">
              {product.category.name}
            </p>
          </div>

          <div className="text-right shrink-0 mt-0.5">
            <p className="text-sm font-semibold text-stone-900 tracking-tight">
              {product.price} zł
            </p>
            {product.onSale && (
              <p className="text-[11px] text-stone-400 line-through mt-0.5">
                {product.regularPrice} zł
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
