/** Kontrolowany przycisk edycji sekcji. */
import { PencilIcon } from "@/components/icons/PencilIcon";

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#171717]/55 transition-colors hover:bg-[#f5f5f4] hover:text-[#171717]"
    >
      <PencilIcon className="h-3 w-3" />
      Edytuj
    </button>
  );
}
