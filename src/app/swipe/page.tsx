import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";
import RappelProfil from "@/components/RappelProfil";

export default function SwipePage() {
  return (
    <main className="flex h-[calc(100dvh_-_env(safe-area-inset-top))] flex-col items-center overflow-hidden px-4 pb-20 pt-3">
      <AppHeader compact hideTop />

      {/* Le paquet de cartes à swiper (remplit l'écran restant) */}
      <div className="flex w-full min-h-0 flex-1 justify-center">
        <SwipeDeck />
      </div>

      {/* Rappel : finalise ton profil si < 100 % */}
      <RappelProfil />
    </main>
  );
}
