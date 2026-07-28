/** Kontrolowany przełącznik wartości logicznej. */
type SwitchSize = "sm" | "md";

const TRACK_CLASSES: Record<SwitchSize, string> = {
  sm: "h-[22px] w-[40px]",
  md: "h-[24px] w-[44px]",
};

const THUMB_CLASSES: Record<SwitchSize, string> = {
  sm: "left-[3px] h-4 w-4",
  md: "left-[2px] h-[20px] w-[20px]",
};

const CHECKED_THUMB_CLASSES: Record<SwitchSize, string> = {
  sm: "translate-x-[18px]",
  md: "translate-x-[20px]",
};

export function Switch({
  checked,
  disabled = false,
  label,
  size = "md",
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  size?: SwitchSize;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group/switch relative shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${TRACK_CLASSES[size]} ${
        checked ? "bg-[#171717]" : "bg-[#D4C9C0]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${THUMB_CLASSES[size]} ${
          checked ? CHECKED_THUMB_CLASSES[size] : ""
        }`}
      />
    </button>
  );
}
