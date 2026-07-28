/** Renderuje ikonę układu siatki. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function GridIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </StrokeIcon>
  );
}
