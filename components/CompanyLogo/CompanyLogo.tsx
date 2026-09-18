/** Renderuje skalowalne logo marki używane w nagłówku i stopce. */
export function CompanyLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-label="Zabawne Koszulki"
      role="img"
      viewBox="0 0 360 72"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
        <path d="M13 21 27 13h18l14 8-8 14-8-4v27H29V31l-8 4-8-14Z" />
        <path d="M31 22c2 4 8 4 10 0" />
        <path d="M32 42c4 3 8 3 12 0" />
      </g>
      <text x="76" y="31" fill="currentColor" fontSize="22" fontWeight="800" letterSpacing="-.5">
        ZABAWNE
      </text>
      <text x="76" y="55" fill="currentColor" fontSize="22" fontWeight="500" letterSpacing="2.2">
        KOSZULKI
      </text>
    </svg>
  );
}
