import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";

export default function SwipePage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <AppHeader showPreferences />

      {/* Le paquet de cartes à swiper */}
      <div className="flex w-full flex-1 items-center justify-center">
        <SwipeDeck />
      </div>
    </main>
  );
}
