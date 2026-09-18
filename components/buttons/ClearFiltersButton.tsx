/** Prezentacyjny przycisk czyszczenia aktywnych filtrów. */
export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 rounded-lg px-2 text-[13px] font-medium text-[#171717]/52 transition-colors hover:text-[#171717]"
    >
      Wyczyść
    </button>
  );
}
