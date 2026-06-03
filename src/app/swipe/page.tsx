import Link from "next/link";
import SwipeDeck from "@/components/SwipeDeck";

export default function SwipePage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      {/* En-tête avec le logo */}
      <header className="mb-6 flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="font-display text-2xl font-semibold">
          <span className="text-signature">Colock&apos;t</span>
        </Link>
        <span className="text-sm text-ink/50">Paris</span>
      </header>

      {/* Le paquet de cartes à swiper */}
      <div className="flex w-full flex-1 items-center justify-center">
        <SwipeDeck />
      </div>
    </main>
  );
}
