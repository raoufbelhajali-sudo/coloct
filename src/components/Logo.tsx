// Logo de Colock't : une maison + un cœur, dans le dégradé signature.

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="colockt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff4d8d" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Maison (toit + corps) en dégradé */}
      <g fill="url(#colockt-grad)">
        <path d="M24 4 L45 22 a2.5 2.5 0 0 1 -1.6 4.4 H4.6 A2.5 2.5 0 0 1 3 22 Z" />
        <rect x="9" y="23" width="30" height="21" rx="6" />
      </g>
      {/* Cœur blanc au centre */}
      <path
        fill="#fff"
        transform="translate(13.5 25.5) scale(0.86)"
        d="M11 19.5C11 19.5 1.5 14 1.5 7.6 1.5 4.5 3.9 2.2 6.9 2.2c1.8 0 3.4.9 4.1 2.3.7-1.4 2.3-2.3 4.1-2.3 3 0 5.4 2.3 5.4 5.4C20.5 14 11 19.5 11 19.5Z"
      />
    </svg>
  );
}

// Logo complet : symbole + nom « Colock't »
export default function Logo({
  markClass = "h-9 w-9",
  textClass = "text-2xl",
}: {
  markClass?: string;
  textClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={markClass} />
      <span className={`text-signature font-display font-semibold ${textClass}`}>
        Colock&apos;t
      </span>
    </span>
  );
}
