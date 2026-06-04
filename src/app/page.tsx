"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Déjà connecté → on va directement dans son espace (pas la page "Commencer")
  useEffect(() => {
    if (loading || !user || !profile) return;
    router.replace(profile.role === "locataire" ? "/locataire" : "/swipe");
  }, [loading, user, profile, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Halos colorés en fond pour l'ambiance nocturne */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet opacity-20 blur-[120px]" />

      {/* Logo */}
      <LogoMark className="mb-4 h-20 w-20 drop-shadow-[0_8px_30px_rgba(255,77,141,0.35)]" />
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
        href="/connexion"
        className="bg-signature glow-pink mt-10 inline-block rounded-full px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105"
      >
        Commencer
      </a>

      {/* Petit pied de page */}
      <p className="absolute bottom-6 text-sm text-ink/40">
        Paris · maintenant en ligne
      </p>
    </main>
  );
}
