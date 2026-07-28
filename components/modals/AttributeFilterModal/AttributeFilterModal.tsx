/** Renderuje modal wyboru wartości pojedynczego filtra atrybutów. */
"use client";

import { CloseButton } from "@/components/buttons/CloseButton";
import { ModalBackdrop } from "@/components/modals/ModalBackdrop";

interface AttributeFilterModalProps {
  attribute: { label: string; slug: string };
  terms: { name: string; slug: string; count: number | null }[];
  activeTerms: string[];
  getCount: (termSlug: string, globalCount: number | null) => number;
  onToggle: (termSlug: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function AttributeFilterModal({
  attribute,
  terms,
  activeTerms,
  getCount,
  onToggle,
  onClear,
  onClose,
}: AttributeFilterModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Wybierz ${attribute.label.toLowerCase()}`}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
    >
      <ModalBackdrop
        label="Zamknij wybór filtra"
        className="bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-xl border border-[#e7e5e4] bg-white">
        <div className="flex items-center justify-between border-b border-[#e7e5e4] px-6 py-4">
          <h2 className="text-lg font-semibold">
            Wybierz {attribute.label.toLowerCase()}
          </h2>
          <div className="flex items-center gap-3">
            {activeTerms.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-sm text-[#27ae60] transition-colors hover:text-[#171717]"
              >
                Wyczyść
              </button>
            )}
            <CloseButton
              onClick={onClose}
              variant="minimal"
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {terms
              .filter((term) => (term.count ?? 0) > 0)
              .map((term) => {
                const checked = activeTerms.includes(term.slug);
                const count = getCount(term.slug, term.count);

                return (
                  <button
                    key={term.slug}
                    type="button"
                    onClick={() => onToggle(term.slug)}
                    disabled={count === 0 && !checked}
                    aria-pressed={checked}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      checked
                        ? "border-[#171717] bg-[#171717]/10 font-medium text-[#171717]"
                        : count === 0
                          ? "cursor-not-allowed border-[#e7e5e4]/50 text-[#171717]/30"
                          : "border-[#e7e5e4] text-[#171717]/80 hover:border-[#171717]/40"
                    }`}
                  >
                    {term.name}
                    <span className={`ml-1.5 text-xs ${checked ? "text-[#27ae60]" : "text-[#171717]/40"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
