/** Renderuje ikonę szewronu skierowanego w dół. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ChevronDownIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  );
}
