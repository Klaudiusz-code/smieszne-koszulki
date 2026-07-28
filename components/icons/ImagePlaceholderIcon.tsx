/** Renderuje zastępczą ikonę używaną przy braku obrazu. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ImagePlaceholderIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </StrokeIcon>
  );
}
