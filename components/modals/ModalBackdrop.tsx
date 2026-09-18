/** Kontrolowane tło zamykające modal po kliknięciu. */
export function ModalBackdrop({
  onClick,
  label,
  position = "absolute",
  className = "",
}: {
  onClick: () => void;
  label: string;
  position?: "absolute" | "fixed";
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${position} inset-0 cursor-default ${className}`}
    />
  );
}
