"use client";

import { useEffect } from "react";
import Link from "next/link";
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
      <LogoMark className="mb-4 h-20 w-20 drop-shadow-[0_8px_30px_rgba(250,82,82,0.35)]" />
      <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
        <span className="text-signature">FlatSwiper</span>
      </h1>

      {/* Accroche */}
      <p className="mt-6 max-w-md text-lg text-ink/80 sm:text-xl">
        Trouve ta chambre en colocation partout en France en swipant. Un match,
        et la conversation commence.
      </p>

      {/* Bouton principal */}
      <Link
        href="/connexion"
        className="bg-signature glow-pink mt-10 inline-block rounded-full px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-105"
      >
        Commencer
      </Link>

      {/* Petit pied de page */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-ink/40">Partout en France · maintenant en ligne</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink/40">
          <Link href="/mentions-legales" className="hover:text-ink/70">
            Mentions légales
          </Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:text-ink/70">
            Confidentialité
          </Link>
          <span>·</span>
          <Link href="/cgu" className="hover:text-ink/70">
            CGU
          </Link>
        </nav>
      </div>
    </main>
  );
}
