/** Renderuje ikonę minusa używaną do zmniejszania wartości. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function MinusIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 12h14" />
    </StrokeIcon>
  );
}
