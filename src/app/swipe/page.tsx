"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import SwipeDeck from "@/components/SwipeDeck";
import RappelProfil from "@/components/RappelProfil";

export default function SwipePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Fond « grunge » sombre : uniquement sur PC web (souris + pas l'app native).
  // Il apparaît dans les marges autour de la carte (centrée sur grand écran).
  const [fondPc, setFondPc] = useState(false);
  useEffect(() => {
    setFondPc(
      !Capacitor.isNativePlatform() &&
        window.matchMedia("(pointer: fine)").matches &&
        window.matchMedia("(min-width: 768px)").matches
    );
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
      return;
    }
    // Compte tout neuf (jamais passé par le parcours) arrivé directement ici →
    // on l'envoie faire son inscription au lieu d'afficher le mur rouge.
    if (profile && (!profile.prenom || profile.prenom === "Anonyme")) {
      router.replace("/bienvenue");
    }
  }, [loading, user, profile, router]);

  return (
    <main
      className="relative flex h-dvh flex-col items-center overflow-hidden px-0 pb-16 pt-2 sm:px-4"
      style={
        fondPc
          ? {
              backgroundImage: "url(/fond-grunge.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
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
