import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  categories,
  getProductsByCategory,
  getCategoryBySlug,
} from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumb
        items={[{ label: "Sklep", href: "/sklep" }, { label: category.name }]}
      />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 text-sm max-w-lg">
            {category.description}
          </p>
        )}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">
          {items.length} produktów
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">
            Brak produktów w tej kategorii.
          </p>
          <a
            href="/sklep"
            className="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-green-600 transition-colors"
          >
            Wróć do sklepu
          </a>
        </div>
      )}
    </div>
  );
}
