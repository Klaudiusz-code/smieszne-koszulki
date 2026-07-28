"use client";

import { useProducts } from "@/packages/commerce/react";
import type { ProductPage } from "@/packages/commerce/core";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/buttons/Button";
import { Filters } from "@/components/Filters/Filters";
import { ListingFilterControls } from "@/components/ListingControls/ListingFilterControls";
import { ListingSortControl } from "@/components/ListingControls/ListingSortControl";
import { useListingParams } from "@/components/ListingControls/useListingParams";
import { RequestError } from "@/components/RequestError";
import { ATTRIBUTES, PER_PAGE, type ProductQueryOptions, type TaxonomyFilter, type TermNode } from "@/lib/catalog-options";

const categories = [{ slug: "", name: "Wszystko" }, { slug: "koszulki", name: "Koszulki" }, { slug: "bluza", name: "Bluzy" }, { slug: "kubki", name: "Kubki" }, { slug: "czapki", name: "Czapki" }, { slug: "gadzety", name: "Gadżety" }];

export type ShopResult = ProductPage;

export function ShopView({ initial, options, taxonomyFilters, attrTerms, categoryId, category, selectedCategory = "" }: {
  initial: ShopResult;
  options: ProductQueryOptions;
  taxonomyFilters: TaxonomyFilter[];
  attrTerms: Record<string, TermNode[]>;
  categoryId?: number;
  category?: { name: string; description: string };
  selectedCategory?: string;
}) {
  const { result, busy: loading, error: loadError, loadMore } = useProducts({ ...options, taxonomyFilters, categoryId, pageSize: PER_PAGE }, initial);
  const error = loadError ? "Nie udało się pobrać kolejnych produktów." : null;
  const { searchParams, pushParams, updateParam } = useListingParams();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        <Breadcrumb items={category ? [{ label: "Sklep", href: "/produkty" }, { label: category.name }] : [{ label: "Sklep" }]} />
        <div className="mb-8 mt-6 border-b border-stone-100 pb-8">
          <h1 className="text-4xl font-medium tracking-tight text-stone-900">{category?.name ?? "Kolekcja"}</h1>
          {category?.description && <p className="mt-3 max-w-xl text-sm text-stone-500">{category.description}</p>}
          <p className="mt-2 text-sm text-stone-500" aria-live="polite">Wyświetlono {result.products.length} z {result.found} produktów</p>
          {!category && <div className="mt-6 flex flex-wrap gap-2">{categories.map((item) => (
            <button key={item.slug} type="button" aria-pressed={selectedCategory === item.slug} onClick={() => updateParam("category", item.slug || null)} className={`rounded-full px-5 py-2.5 text-xs font-medium ${selectedCategory === item.slug ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"}`}>{item.name}</button>
          ))}</div>}
        </div>
        <form className="mb-5 flex gap-2" onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
          updateParam("q", value || null);
        }}>
          <input aria-label="Szukaj produktów" name="q" defaultValue={options.search} placeholder="Szukaj produktów…" className="min-w-0 flex-1 rounded-xl border border-stone-200 px-4 py-2" />
          <Button type="submit" variant="primary">Szukaj</Button>
        </form>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <ListingFilterControls options={options} />
          <ListingSortControl options={options} />
          <Filters attributes={ATTRIBUTES} attrTerms={attrTerms} />
          {searchParams.size > 0 && <Button onClick={() => pushParams(new URLSearchParams())}>Wyczyść filtry</Button>}
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {result.products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {result.products.length === 0 && <p className="py-20 text-center text-stone-500">Brak produktów dla wybranych filtrów.</p>}
        {error && <RequestError message={error} />}
        {result.hasNextPage && <div className="mt-10 text-center"><Button size="lg" variant="outline" onClick={() => void loadMore().catch(() => {})} loading={loading} loadingLabel="Ładowanie…">{error ? "Spróbuj ponownie" : "Pokaż więcej"}</Button></div>}
      </div>
    </div>
  );
}
