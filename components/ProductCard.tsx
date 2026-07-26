import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/sklep/${product.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden transition-all duration-500 ease-out h-full flex flex-col hover:shadow-lg hover:shadow-stone-200/40 hover:-translate-y-0.5 hover:border-stone-200">
        <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {product.onSale && (
            <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-medium tracking-wider px-3 py-1.5 rounded-full">
              Promocja
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out">
            <span className="flex items-center justify-center w-full py-3 bg-white/95 backdrop-blur-sm text-black text-[11px] font-medium uppercase tracking-widest rounded-xl border border-stone-200/50">
              Zobacz szczegóły
            </span>
          </div>
        </div>

        <div className="p-5 pt-4 flex-1 flex flex-col">
          <p className="text-[11px] text-stone-400 font-normal tracking-wide mb-1.5">
            {product.category.name}
          </p>
          <h3 className="text-sm font-medium text-black tracking-tight leading-snug mb-4 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-stone-100">
            <span className="text-base font-medium text-black">
              {product.price} zł
            </span>
            {product.onSale && (
              <span className="text-sm text-stone-400 line-through font-normal">
                {product.regularPrice} zł
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
