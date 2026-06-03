export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Halos colorés en fond pour l'ambiance nocturne */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet opacity-20 blur-[120px]" />

      {/* Logo */}
      <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
        <span className="text-signature">Colock&apos;t</span>
      </h1>

      {/* Accroche */}
      <p className="mt-6 max-w-md text-lg text-ink/80 sm:text-xl">
        Trouve ta chambre en colocation à Paris en swipant. Un match, et la
        conversation commence.
      </p>

      {/* Bouton principal */}
      <a
        href="/swipe"
        className="bg-signature glow-pink mt-10 inline-block rounded-full px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105"
      >
        Commencer à swiper
      </a>

      {/* Petit pied de page */}
      <p className="absolute bottom-6 text-sm text-ink/40">
        Paris · MVP en construction
      </p>
    </main>
  );
}
