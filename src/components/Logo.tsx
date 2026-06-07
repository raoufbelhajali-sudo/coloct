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
      </g>
      {/* Anneau de la clé = bas du F, même épaisseur que les barres (8) */}
      <circle
        cx="17"
        cy="37"
        r="7"
        fill="none"
        stroke="url(#colockt-grad)"
        strokeWidth="8"
      />
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
