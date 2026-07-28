/** Renderuje ikonę etykiety ceny lub rabatu. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function TagIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </StrokeIcon>
  );
}
