/** Ikonowy przycisk akcji używany w nagłówku strony. */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function HeaderIconButton({
  label,
  children,
  className = "",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-label"> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-cd-brown transition-colors hover:bg-[#f5f5f4] ${className}`}
    >
      {children}
    </button>
  );
}
