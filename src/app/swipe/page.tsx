"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Smartphone, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";
import RappelProfil from "@/components/RappelProfil";

export default function SwipePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  // Bandeau "télécharge l'app" : seulement sur le web, masquable
  const [surWeb, setSurWeb] = useState(false);
  const [bandeau, setBandeau] = useState(true);
  useEffect(() => {
    setSurWeb(!Capacitor.isNativePlatform());
  }, []);

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
    <main className="relative flex h-dvh flex-col items-center overflow-hidden px-4 pb-20 pt-2">
      {surWeb && bandeau && (
        <div className="mb-2 flex w-full max-w-md items-center gap-2 rounded-full bg-panel px-3 py-2 text-xs text-ink/70 ring-1 ring-ink/10">
          <Smartphone className="h-4 w-4 shrink-0 text-bleu" />
          <span className="flex-1">
            Pour la meilleure expérience, télécharge l&apos;app FlatSwiper.
          </span>
          <button
            onClick={() => setBandeau(false)}
            aria-label="Fermer"
            className="shrink-0 text-ink/40 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <AppHeader />

      {/* Le paquet de cartes à swiper (remplit l'écran restant) */}
      <div className="flex w-full min-h-0 flex-1 justify-center">
        <SwipeDeck />
      </div>

      {/* Rappel : finalise ton profil si < 100 % */}
      <RappelProfil />
    </main>
  );
}
