// Logo de FlatMap : une clé (accès au logement) avec un cœur évidé
// (trouver la bonne coloc), dans le dégradé signature corail → orange.

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="colockt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fa5252" />
          <stop offset="100%" stopColor="#fd7e14" />
        </linearGradient>
      </defs>
      <g fill="url(#colockt-grad)">
        {/* Tête de la clé */}
        <circle cx="24" cy="14" r="12" />
        {/* Tige + dents de la clé */}
        <path d="M21 24 h6 v8 h4 v3 h-4 v4 h3 v3 h-3 v3 h-6 z" />
      </g>
      {/* Cœur blanc évidé (le "trou" de la clé) */}
      <path
        fill="#fff"
        transform="translate(16.5 6.2) scale(0.62)"
        d="M12 21 C12 21 3 15 3 8.5 C3 5.4 5.5 3 8.5 3 C10.3 3 11.5 4 12 5 C12.5 4 13.7 3 15.5 3 C18.5 3 21 5.4 21 8.5 C21 15 12 21 12 21 Z"
      />
    </svg>
  );
}

// Logo complet : symbole + nom « FlatMap »
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
        FlatMap
      </span>
    </span>
  );
}
