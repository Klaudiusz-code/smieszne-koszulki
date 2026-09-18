/** Renderuje grupy filtrów atrybutów i umożliwia zmianę ich aktywnych wartości. */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TermNode {
  name: string;
  slug: string;
  count: number | null;
}

export function AttributeFilterPanel({
  attributes,
  attrTerms,
  facetedCounts,
}: {
  attributes: { label: string; slug: string }[];
  attrTerms: Record<string, TermNode[]>;
  facetedCounts?: Record<string, Record<string, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active: Record<string, string[]> = {};
  const hasFaceted = facetedCounts && Object.keys(facetedCounts).length > 0;

  searchParams.forEach((value, key) => {
    if (key.startsWith("pa_")) {
      active[key] = value.split(",").filter(Boolean);
    }
  });

  function getCount(attrSlug: string, termSlug: string, globalCount: number | null): number {
    if (hasFaceted && facetedCounts[attrSlug]) {
      return facetedCounts[attrSlug][termSlug] ?? 0;
    }
    return globalCount ?? 0;
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

  const visibleGroups = attributes.filter((attribute) => {
    const terms = (attrTerms[attribute.slug] ?? []).filter((term) => (term.count ?? 0) > 0);
    return terms.length > 0;
  });

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-7">
      {visibleGroups.map((attribute) => (
        <section key={attribute.slug}>
          <h3 className="text-[15px] font-medium text-cd-brown">{attribute.label}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(attrTerms[attribute.slug] ?? [])
              .filter((term) => (term.count ?? 0) > 0)
              .map((term) => {
                const checked = (active[attribute.slug] ?? []).includes(term.slug);
                const count = getCount(attribute.slug, term.slug, term.count);

                return (
                  <button
                    key={term.slug}
                    type="button"
                    onClick={() => toggleFilter(attribute.slug, term.slug)}
                    disabled={count === 0 && !checked}
                    aria-pressed={checked}
                    className={`min-h-10 rounded-lg border px-3 py-2 text-[14px] transition-colors ${
                      checked
                        ? "border-[#171717] bg-[#171717] font-medium text-white"
                        : count === 0
                          ? "cursor-not-allowed border-[#e7e5e4]/60 bg-white text-[#171717]/30"
                          : "border-[#e7e5e4] bg-white text-[#171717]/78 hover:border-[#171717]/40 hover:bg-[#fafaf9]"
                    }`}
                  >
                    {term.name}
                    <span className={`ml-1.5 text-xs ${checked ? "text-white/72" : "text-[#171717]/40"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
