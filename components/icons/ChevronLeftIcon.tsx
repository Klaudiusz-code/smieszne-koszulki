/** Renderuje ikonę szewronu skierowanego w lewo. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ChevronLeftIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </StrokeIcon>
  );
}
