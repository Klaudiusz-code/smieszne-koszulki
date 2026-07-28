/** Renderuje ikonę powiększania obrazu. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ZoomInIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </StrokeIcon>
  );
}
