/**
 * Odpowiedzialność komponentu:
 * - prezentuje dostępne filtry produktów,
 * - synchronizuje wybór filtrów z parametrami listingu,
 * - otwiera modal wyboru wartości dla rozbudowanych atrybutów.
 */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AttributeFilterModal } from "@/components/modals/AttributeFilterModal/AttributeFilterModal";

interface TermNode {
  name: string;
  slug: string;
  count: number | null;
}

interface AttributeDef {
  label: string;
  slug: string;
}

export function Filters({
  attributes,
  attrTerms,
  facetedCounts,
}: {
  attributes: AttributeDef[];
  attrTerms: Record<string, TermNode[]>;
  facetedCounts?: Record<string, Record<string, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openAttr, setOpenAttr] = useState<string | null>(null);

  function activeFilters(): Record<string, string[]> {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("pa_")) {
        filters[key] = value.split(",").filter(Boolean);
      }
    });
    return filters;
  }

  const active = activeFilters();
  const hasFaceted = facetedCounts && Object.keys(facetedCounts).length > 0;

  function getCount(attrSlug: string, termSlug: string, globalCount: number | null): number {
    if (hasFaceted && facetedCounts[attrSlug]) {
      return facetedCounts[attrSlug][termSlug] ?? 0;
    }
    return globalCount ?? 0;
  }

  function getTermName(attrSlug: string, termSlug: string): string {
    const terms = attrTerms[attrSlug] ?? [];
    return terms.find((term) => term.slug === termSlug)?.name ?? termSlug;
  }

  function toggleFilter(attrSlug: string, termSlug: string) {
    const current = active[attrSlug] ?? [];
    const next = current.includes(termSlug)
      ? current.filter((slug) => slug !== termSlug)
      : [...current, termSlug];

    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    if (next.length > 0) {
      params.set(attrSlug, next.join(","));
    } else {
      params.delete(attrSlug);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());

    searchParams.forEach((_, key) => {
      if (key.startsWith("pa_")) {
        params.delete(key);
      }
    });
    params.delete("after");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    setOpenAttr(null);
  }

  const visibleGroups = attributes.filter((attribute) => {
    const terms = (attrTerms[attribute.slug] ?? []).filter((term) => (term.count ?? 0) > 0);
    return terms.length > 0;
  });

  const openAttribute = visibleGroups.find((attribute) => attribute.slug === openAttr) ?? null;

  return (
    <>
      {visibleGroups.map((attribute) => {
        const activeTerms = active[attribute.slug] ?? [];

        return (
          <div key={attribute.slug} className="flex items-center">
            <button
              type="button"
              onClick={() => setOpenAttr(attribute.slug)}
              className={`inline-flex h-9 items-center border px-3 text-[14px] font-medium transition-colors ${
                activeTerms.length === 0
                  ? "rounded-lg border-[#e7e5e4] bg-white text-cd-brown hover:bg-[#fafaf9]"
                  : "rounded-l-lg border-[#171717] bg-[#171717] text-white hover:bg-[#3d2a25]"
              }`}
            >
              Wybierz {attribute.label.toLowerCase()}
            </button>
            {activeTerms.map((termSlug) => (
              <button
                key={termSlug}
                type="button"
                onClick={() => toggleFilter(attribute.slug, termSlug)}
                className="-ml-px inline-flex h-9 items-center gap-1 border border-[#e7e5e4] bg-white px-3 text-[14px] font-medium text-cd-brown transition-colors last:rounded-r-lg hover:bg-[#fafaf9]"
              >
                {getTermName(attribute.slug, termSlug)}
                <span className="text-cd-brown/35">×</span>
              </button>
            ))}
          </div>
        );
      })}

      {openAttribute && (
        <AttributeFilterModal
          attribute={openAttribute}
          terms={attrTerms[openAttribute.slug] ?? []}
          activeTerms={active[openAttribute.slug] ?? []}
          getCount={(termSlug, globalCount) =>
            getCount(openAttribute.slug, termSlug, globalCount)
          }
          onToggle={(termSlug) => toggleFilter(openAttribute.slug, termSlug)}
          onClear={clearFilters}
          onClose={() => setOpenAttr(null)}
        />
      )}
    </>
  );
}
