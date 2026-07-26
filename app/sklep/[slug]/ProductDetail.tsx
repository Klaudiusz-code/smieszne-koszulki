"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/CartContext";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {},
  );

  const { addItem } = useCart();

  const handleAttrClick = (attrName: string, option: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [attrName]: option }));
  };

  const currentImage =
    product.galleryImages[activeImage]?.sourceUrl || product.image.sourceUrl;

  const allAttrsSelected = product.attributes.every(
    (attr) => selectedAttrs[attr.name],
  );

  const buttonText = !product.inStock
    ? "Niedostępny"
    : !allAttrsSelected && product.attributes.length > 0
      ? "Wybierz opcje"
      : "Dodaj do koszyka";

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
      <Breadcrumb
        items={[
          { label: "Sklep", href: "/sklep" },
          {
            label: product.category.name,
            href: `/kategoria/${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 mt-8 mb-28">
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-[4/5] bg-stone-50 rounded-3xl overflow-hidden ring-1 ring-stone-100">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {product.onSale && (
              <div className="absolute top-6 left-6 bg-stone-900 text-stone-50 text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2 rounded-full">
                Promocja
              </div>
            )}
          </div>

          {product.galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square bg-stone-50 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ${
                    activeImage === i
                      ? "ring-stone-900 scale-95"
                      : "ring-transparent hover:ring-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.sourceUrl}
                    alt={img.altText}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-medium text-stone-400 tracking-[0.2em] uppercase">
              {product.category.name}
            </p>
            <h1 className="text-3xl lg:text-4xl font-medium text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-medium text-stone-900 tracking-tight">
              {product.price} zł
            </span>
            {product.onSale && (
              <span className="text-lg text-stone-400 line-through font-normal">
                {product.regularPrice} zł
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 pb-6 border-b border-stone-100">
            <span
              className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-[#27ae60]" : "bg-stone-300"}`}
            />
            <span className="text-sm text-stone-500 font-light">
              {product.inStock ? "Dostępny — wysyłka w 24h" : "Niedostępny"}
            </span>
          </div>

          <div
            className="prose prose-sm prose-stone text-stone-600 font-light leading-relaxed max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {product.attributes.map((attr) => (
            <div key={attr.name} className="space-y-3">
              <p className="text-xs font-medium text-stone-900 tracking-wide">
                {attr.name}:{" "}
                <span className="text-stone-400 font-normal">
                  {selectedAttrs[attr.name] || "Wybierz"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAttrClick(attr.name, opt)}
                    className={`min-w-[48px] h-12 px-5 rounded-full text-sm font-medium transition-all duration-300
                      ${
                        selectedAttrs[attr.name] === opt
                          ? "bg-stone-900 text-white shadow-sm"
                          : "bg-stone-50 text-stone-700 ring-1 ring-stone-200 hover:ring-stone-400 hover:bg-stone-100"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 pt-4">
            <button
              disabled={
                !product.inStock ||
                (!allAttrsSelected && product.attributes.length > 0)
              }
              onClick={() => {
                addItem({
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.image.sourceUrl,
                  selectedAttrs: selectedAttrs,
                });
              }}
              className="w-full py-4 bg-[#27ae60] text-white rounded-full font-medium tracking-wide hover:bg-[#219150] transition-colors disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed disabled:hover:bg-stone-200 shadow-sm shadow-[#27ae60]/20"
            >
              {buttonText}
            </button>

            <a
              href={`mailto:kontakt@smiesznekoszulki.pl?subject=Pytanie o: ${product.name}`}
              className="w-full py-4 text-center text-sm font-medium text-stone-500 underline underline-offset-4 decoration-stone-200 hover:decoration-stone-900 transition-colors"
            >
              Zapytaj o personalizację
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-100">
            {["Wysyłka 24h", "Bezpieczne pakowanie", "Trwały nadruk"].map(
              (text) => (
                <div key={text} className="text-center">
                  <p className="text-[11px] text-stone-400 font-medium leading-tight">
                    {text}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-stone-100 pt-16">
          <h2 className="text-2xl font-medium text-stone-900 tracking-tight mb-10">
            Może Ci się również spodobać
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
