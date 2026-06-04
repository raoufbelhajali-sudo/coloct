import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";

export default function SwipePage() {
  return (
    <main className="flex h-dvh flex-col items-center overflow-hidden px-4 py-4">
      <AppHeader />

      {/* Le paquet de cartes à swiper (remplit l'écran restant) */}
      <div className="flex w-full min-h-0 flex-1 justify-center">
        <SwipeDeck />
      </div>
    </main>
  );
}
