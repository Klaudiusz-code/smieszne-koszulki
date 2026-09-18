/** Prezentacyjny przycisk zamknięcia z ikoną. */
import type { MouseEventHandler } from "react";
import { XIcon } from "@/components/icons/XIcon";

type CloseButtonVariant = "default" | "subtle" | "minimal" | "dark";

const VARIANT_CLASSES: Record<CloseButtonVariant, string> = {
  default:
    "border border-[#eaded7] bg-cd-cream text-cd-brown hover:bg-[#f5f5f4] focus:outline-none focus:ring-2 focus:ring-cd-gold",
  subtle: "text-[#171717]/62 hover:bg-[#fafaf9] hover:text-[#171717]",
  minimal: "text-[#171717]/60 hover:text-[#171717]",
  dark: "bg-white/12 text-white hover:bg-white/20",
};

export function CloseButton({
  onClick,
  label = "Zamknij",
  variant = "default",
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  label?: string;
  variant?: CloseButtonVariant;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${VARIANT_CLASSES[variant]}`}
    >
      <XIcon className={variant === "minimal" ? "h-4 w-4" : "h-5 w-5"} />
    </button>
  );
}
