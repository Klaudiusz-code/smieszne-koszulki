/** Renderuje ikonę zamknięcia lub usunięcia elementu. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function XIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </StrokeIcon>
  );
}
