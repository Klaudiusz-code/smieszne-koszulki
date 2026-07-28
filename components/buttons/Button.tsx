/** Bazowy, prezentacyjny przycisk tekstowy. */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "form" | "lg";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 rounded-lg px-4 text-[13px]",
  md: "h-10 rounded-xl px-5 text-sm",
  form: "min-h-11 rounded-xl px-5 py-3 text-sm",
  lg: "min-h-12 rounded-xl px-7 py-3 text-sm",
};

export function Button({
  variant = "ghost",
  size = "sm",
  loading = false,
  loadingLabel,
  elevated = false,
  type = "button",
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: ReactNode;
  elevated?: boolean;
}) {
  const variantClassName =
    variant === "primary"
      ? "bg-cd-brown text-white hover:bg-[#000000]"
      : variant === "outline"
        ? "border border-[#D4C5BC] bg-white text-cd-brown hover:border-cd-brown hover:bg-cd-cream"
        : "text-cd-brown/70 hover:bg-cd-cream hover:text-cd-brown";

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${variantClassName} ${
        elevated ? "shadow-[0_6px_20px_rgba(78,52,46,0.20)]" : ""
      } ${className}`}
    >
      {loading && loadingLabel !== undefined ? loadingLabel : children}
    </button>
  );
}
