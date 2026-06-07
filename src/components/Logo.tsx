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
      {/* F façon clé : 2 bras (dents) en haut + tige + anneau (tête) en bas */}
      <g fill="url(#colockt-grad)">
        {/* Tige verticale = barre du F / corps de la clé */}
        <rect x="13" y="8" width="8" height="26" rx="3" />
        {/* Bras supérieur du F = dent du haut */}
        <rect x="13" y="8" width="22" height="7" rx="3" />
        {/* Bras médian du F = dent du milieu (plus courte) */}
        <rect x="13" y="19" width="15" height="7" rx="3" />
        {/* Anneau / tête de la clé = bas du F */}
        <circle cx="17" cy="39" r="8.5" />
      </g>
      {/* Trou de serrure au centre de l'anneau */}
      <circle cx="17" cy="39" r="3.4" fill="#fff" />
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
