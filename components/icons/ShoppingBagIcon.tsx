/** Renderuje ikonę torby zakupowej. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ShoppingBagIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </StrokeIcon>
  );
}
