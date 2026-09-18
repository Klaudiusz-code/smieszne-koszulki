/** Renderuje pustą lub wypełnioną gwiazdkę oceny. */
import { type FillableIconProps } from "@/components/icons/IconBase";

export function StarIcon({ filled, className, ...props }: FillableIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path
        d="m12 2.9 2.78 5.63 6.22.9-4.5 4.39 1.06 6.19L12 17.08l-5.56 2.93 1.06-6.19L3 9.43l6.22-.9L12 2.9Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
