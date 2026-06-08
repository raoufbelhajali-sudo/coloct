// Logo de FlatSwiper : deux profils (corail + bleu) qui se rejoignent en un
// cœur = un match. Image symbole (transparente) dans public/logo-symbol.png.

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-symbol.png"
      alt=""
      aria-hidden="true"
      className={`${className} object-contain`}
    />
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
