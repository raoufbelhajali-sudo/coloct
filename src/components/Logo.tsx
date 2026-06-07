// Logo de FlatSwiper : un « F » (initiale) façon clé — un trou de serrure
// percé dans la barre du haut — dans le dégradé signature corail → orange.

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient
          id="colockt-grad"
          gradientUnits="userSpaceOnUse"
          x1="8"
          y1="6"
          x2="40"
          y2="47"
        >
          <stop offset="0%" stopColor="#fa5252" />
          <stop offset="100%" stopColor="#fd7e14" />
        </linearGradient>
      </defs>
      {/* F façon clé : 2 bras (dents) en haut + tige + tête (anneau) tout en bas */}
      <g fill="url(#colockt-grad)">
        {/* Tige verticale = barre du F / corps de la clé */}
        <rect x="13" y="6" width="8" height="25" rx="3" />
        {/* Bras supérieur du F = dent du haut */}
        <rect x="13" y="6" width="22" height="7" rx="3" />
        {/* Bras médian du F = dent du milieu (plus courte) */}
        <rect x="13" y="16" width="15" height="7" rx="3" />
        {/* Tête de la clé = anneau tout en bas du F */}
        <circle cx="17" cy="38" r="9" />
      </g>
      {/* Cœur blanc évidé au centre de la tête */}
      <path
        fill="#fff"
        transform="translate(11 32) scale(0.5)"
        d="M12 21 C12 21 3 15 3 8.5 C3 5.4 5.5 3 8.5 3 C10.3 3 11.5 4 12 5 C12.5 4 13.7 3 15.5 3 C18.5 3 21 5.4 21 8.5 C21 15 12 21 12 21 Z"
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
