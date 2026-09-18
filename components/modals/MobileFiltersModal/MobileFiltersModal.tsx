/**
 * Odpowiedzialność komponentu:
 * - udostępnia filtry i sortowanie w mobilnym panelu modalnym,
 * - pozwala wyczyścić aktywne kryteria,
 * - zamyka panel po zatwierdzeniu wyboru użytkownika.
 */
"use client";

import { AttributeFilterPanel } from "@/components/Filters/AttributeFilterPanel";
import { ClearFiltersButton } from "@/components/buttons/ClearFiltersButton";
import { CloseButton } from "@/components/buttons/CloseButton";
import { ModalBackdrop } from "@/components/modals/ModalBackdrop";
import { ListingFilterControls } from "@/components/ListingControls/ListingFilterControls";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { ProductQueryOptions, TermNode } from "@/lib/catalog-options";

export function MobileFiltersModal({
  activeFilterCount,
  attributes,
  attrTerms,
  facetedCounts,
  productQueryOptions,
  onClearFilters,
  onClose,
}: {
  activeFilterCount: number;
  attributes: { label: string; slug: string }[];
  attrTerms: Record<string, TermNode[]>;
  facetedCounts: Record<string, Record<string, number>>;
  productQueryOptions: ProductQueryOptions;
  onClearFilters: () => void;
  onClose: () => void;
}) {
  useBodyScrollLock(true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filtry produktów"
      className="fixed inset-0 z-[70]"
    >
      <ModalBackdrop
        label="Zamknij filtry"
        onClick={onClose}
        className="bg-black/38 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[22px] border border-[#e7e5e4] bg-[#fafaf9] shadow-[0_-18px_44px_rgba(78,52,46,0.22)]">
        <div className="flex items-center justify-between border-b border-[#e7e5e4] bg-white px-5 py-4">
          <div>
            <h2 className="text-[20px] font-medium text-cd-brown">Filtry</h2>
            <p className="mt-0.5 text-[13px] text-cd-brown/55">
              {activeFilterCount > 0
                ? `${activeFilterCount} aktywne`
                : "Dopasuj listę produktów"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 ? (
              <ClearFiltersButton onClick={onClearFilters} />
            ) : null}
            <CloseButton
              onClick={onClose}
              variant="subtle"
            />
          </div>
        </div>

        <div className="max-h-[calc(88vh-76px)] overflow-y-auto px-5 py-5">
          <ListingFilterControls options={productQueryOptions} variant="panel" />
          <div className="mt-8 border-t border-[#e7e5e4] pt-6">
            <AttributeFilterPanel
              attributes={attributes}
              attrTerms={attrTerms}
              facetedCounts={facetedCounts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
