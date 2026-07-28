/** Renderuje ikonę potwierdzenia operacji. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function CheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <polyline points="20 6 9 17 4 12" />
    </StrokeIcon>
  );
}
