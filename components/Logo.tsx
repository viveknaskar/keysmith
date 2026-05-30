// Keysmith mark: a forged hexagonal-bow key with a keyhole. Glyph only (no tile),
// so it can sit inside the header's existing rounded panel. The stroke gradient
// uses userSpaceOnUse because an objectBoundingBox gradient collapses to nothing
// on the zero-area horizontal/vertical lines that form the shaft and teeth.
export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id="ks-key-mark" gradientUnits="userSpaceOnUse" x1="14" y1="6" x2="34" y2="44">
          <stop offset="0" stopColor="#cdd8fc" />
          <stop offset="1" stopColor="#7aa2f7" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#ks-key-mark)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Hexagonal bow (forged head) */}
        <path d="M24 6 L32.66 11 L32.66 21 L24 26 L15.34 21 L15.34 11 Z" />
        {/* Shaft */}
        <line x1="24" y1="26" x2="24" y2="43" />
        {/* Teeth */}
        <line x1="24" y1="35" x2="31" y2="35" />
        <line x1="24" y1="42" x2="29" y2="42" />
        {/* Keyhole */}
        <circle cx="24" cy="16" r="3" fill="url(#ks-key-mark)" stroke="none" />
      </g>
    </svg>
  );
}
