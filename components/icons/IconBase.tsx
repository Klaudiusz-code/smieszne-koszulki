/** Udostępnia wspólną bazę SVG oraz typy właściwości dla ikon konturowych. */
import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;
export type FillableIconProps = IconProps & { filled?: boolean };

export function StrokeIcon({
  className,
  children,
  strokeWidth = 2,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
