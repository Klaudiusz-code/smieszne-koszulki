/** Renderuje strzałkę oznaczającą przejście do zewnętrznego zasobu. */
import { StrokeIcon, type IconProps } from "@/components/icons/IconBase";

export function ExternalArrowIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </StrokeIcon>
  );
}
