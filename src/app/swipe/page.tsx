"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";
import RappelProfil from "@/components/RappelProfil";

export default function SwipePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Le swipe colocataire est réservé aux chercheurs.
  // Un annonceur (propriétaire / locataire / AGENCE) est renvoyé vers son espace.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (profile && profile.role === "locataire") {
      router.replace("/locataire");
    }
  }, [loading, user, profile, router]);

  return (
    <main className="relative flex h-dvh flex-col items-center overflow-hidden px-4 pb-20 pt-5">
      <AppHeader hideTop />

      {/* Le paquet de cartes à swiper (remplit l'écran restant) */}
      <div className="flex w-full min-h-0 flex-1 justify-center">
        <SwipeDeck />
      </div>

      {/* Rappel : finalise ton profil si < 100 % */}
      <RappelProfil />
    </main>
  );
}
