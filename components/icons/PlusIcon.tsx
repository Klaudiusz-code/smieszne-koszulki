/** Renderuje ikonę plusa używaną do zwiększania wartości. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function PlusIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </StrokeIcon>
  );
}
