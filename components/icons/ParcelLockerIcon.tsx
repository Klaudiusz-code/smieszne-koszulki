/** Renderuje ikonę automatu paczkowego. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ParcelLockerIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="5" width="8" height="5" rx="1" />
      <path d="M9 14h6" />
      <path d="M9 17h6" />
    </StrokeIcon>
  );
}
