/** Renderuje ikonę filtrowania wyników. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function FilterIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </StrokeIcon>
  );
}
