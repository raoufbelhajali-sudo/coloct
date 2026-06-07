// Logo de FlatSwiper : un « F » (initiale) façon clé — un trou de serrure
// percé dans la barre du haut — dans le dégradé signature corail → orange.

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="colockt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fa5252" />
          <stop offset="100%" stopColor="#fd7e14" />
        </linearGradient>
      </defs>
      {/* La lettre F (barre verticale + 2 bras), coins arrondis */}
      <g fill="url(#colockt-grad)">
        <rect x="13" y="8" width="8" height="32" rx="3" />
        <rect x="13" y="8" width="24" height="8" rx="3" />
        <rect x="13" y="20" width="17" height="8" rx="3" />
      </g>
      {/* Trou de serrure (clin d'œil "clé") percé dans le bras du haut */}
      <circle cx="31.5" cy="12" r="2.6" fill="#fff" />
    </svg>
  );
}

// Logo complet : symbole + nom « FlatSwiper »
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
        FlatSwiper
      </span>
    </span>
  );
}
