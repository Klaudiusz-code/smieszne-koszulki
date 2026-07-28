/** Renderuje ikonę znacznika lokalizacji. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function MapPinIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </StrokeIcon>
  );
}
