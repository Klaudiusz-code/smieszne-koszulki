/** Renderuje ikonę szewronu skierowanego w prawo. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ChevronRightIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </StrokeIcon>
  );
}
