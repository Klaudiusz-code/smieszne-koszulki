/** Renderuje ikonę strzałki skierowanej w prawo. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ArrowRightIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </StrokeIcon>
  );
}
