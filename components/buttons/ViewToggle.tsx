/** Renderuje kontrolowany przycisk przełączający pomiędzy siatką i listą. */
import { GridIcon } from "@/components/icons/GridIcon";
import { ListIcon } from "@/components/icons/ListIcon";

export function ViewToggle({
  isGrid,
  onClick,
}: {
  isGrid: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isGrid ? "Przełącz na widok listy" : "Przełącz na widok siatki"}
      onClick={onClick}
      className="relative inline-flex h-9 w-[68px] items-center overflow-hidden rounded-lg bg-[#fafaf9] text-[#171717] shadow-[0_8px_18px_rgba(78,52,46,0.08)]"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[#171717] shadow-[0_8px_16px_rgba(78,52,46,0.22)] transition-transform duration-200 ${
          isGrid
            ? "translate-x-0 rounded-l-lg rounded-r-none"
            : "translate-x-full rounded-r-lg rounded-l-none"
        }`}
      />
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-full w-1/2 items-center justify-center transition-colors ${
          isGrid ? "text-white" : "text-[#171717]/55"
        }`}
      >
        <GridIcon className="h-4 w-4" />
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-full w-1/2 items-center justify-center transition-colors ${
          isGrid ? "text-[#171717]/55" : "text-white"
        }`}
      >
        <ListIcon className="h-4 w-4" />
      </span>
      <span className="sr-only">
        {isGrid ? "Aktualny widok: siatka" : "Aktualny widok: lista"}
      </span>
    </button>
  );
}
