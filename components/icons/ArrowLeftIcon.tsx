/** Renderuje ikonę strzałki skierowanej w lewo. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ArrowLeftIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </StrokeIcon>
  );
}
