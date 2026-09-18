/** Prezentacyjny przycisk ustawień zgód cookies. */
import { CookieIcon } from "@/components/icons/CookieIcon";

export function CookieSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-left text-white underline-offset-4 transition-colors hover:text-cd-gold hover:underline"
    >
      <CookieIcon className="h-3.5 w-3.5" />
      Ustawienia cookies
    </button>
  );
}
