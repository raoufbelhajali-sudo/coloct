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
      {/* F façon clé : anneau (tête) en haut + tige verticale + 2 dents (bras) */}
      <g fill="url(#colockt-grad)">
        {/* Anneau / tête de la clé = sommet du F */}
        <circle cx="15" cy="13" r="9" />
        {/* Tige verticale = barre du F / corps de la clé */}
        <rect x="11.5" y="13" width="7" height="27" rx="3.5" />
        {/* Dent du haut = bras supérieur du F */}
        <rect x="18" y="9" width="16" height="6.5" rx="2.5" />
        {/* Dent du milieu = bras médian du F (plus courte) */}
        <rect x="18" y="20.5" width="11" height="6.5" rx="2.5" />
      </g>
      {/* Trou de serrure au centre de l'anneau */}
      <circle cx="15" cy="13" r="3.4" fill="#fff" />
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
