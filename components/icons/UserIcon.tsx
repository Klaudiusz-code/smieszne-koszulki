/** Renderuje ikonę konta użytkownika. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function UserIcon(props: IconProps) {
  return (
    <StrokeIcon {...props} strokeWidth={1.5}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </StrokeIcon>
  );
}
