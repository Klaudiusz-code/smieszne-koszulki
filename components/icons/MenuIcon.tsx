/** Renderuje ikonę otwierającą menu nawigacyjne. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function MenuIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </StrokeIcon>
  );
}
