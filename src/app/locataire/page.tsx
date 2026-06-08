"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Home, Snowflake } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ProfileSwipeDeck from "@/components/ProfileSwipeDeck";
import AccrocheAnnonceur from "@/components/AccrocheAnnonceur";
import { useAuth } from "@/lib/auth";
import { getMyListing } from "@/lib/locataire";
import type { Listing } from "@/data/listings";

export default function LocatairePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);

  // Pas connecté → connexion ; colocataire → son espace de swipe
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/connexion");
    else if (profile && profile.role !== "locataire") router.replace("/swipe");
  }, [loading, user, profile, router]);

  const chargerAnnonce = useCallback(async () => {
    if (!user) return;
    setChargement(true);
    setListing(await getMyListing(user.id));
    setChargement(false);
  }, [user]);

  useEffect(() => {
    if (user) chargerAnnonce();
  }, [user, chargerAnnonce]);

  return (
    <main className="flex h-dvh flex-col items-center overflow-hidden px-4 pb-24 pt-5">
      <AppHeader />

      <div className="flex w-full min-h-0 flex-1 flex-col items-center">
        {chargement ? (
          <p className="mt-20 text-ink/60">Chargement…</p>
        ) : !listing ? (
          // Pas encore d'annonce → invite à la créer
          <div className="m-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Home className="h-12 w-12 text-bleu" />
            <p className="font-display text-2xl">Crée ton annonce</p>
            <p className="text-sm text-ink/70">
              Publie ta chambre pour voir les colocataires intéressés et commencer
              à matcher.
            </p>
            <Link
              href="/mon-annonce"
              className="bg-signature glow-pink rounded-full px-6 py-3 font-semibold text-white"
            >
              Décrire mon bien
            </Link>
          </div>
        ) : listing.gelee ? (
          // Annonce gelée (bien loué) → on ne swipe plus
          <div className="m-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Snowflake className="h-12 w-12 text-violet" />
            <p className="font-display text-2xl">Annonce gelée</p>
            <p className="text-sm text-ink/70">
              Ton bien est loué : ton annonce est masquée et tu ne reçois plus de
              candidats. Tu peux la réactiver quand tu veux.
            </p>
            <Link
              href="/mon-annonce"
              className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
            >
              Réactiver mon annonce
            </Link>
          </div>
        ) : (
          // Annonce publiée → on swipe sur les colocataires (deck maximisé)
          <div className="flex h-full w-full max-w-sm flex-col">
            <div className="mb-2 flex w-full items-center justify-between">
              <p className="flex items-center gap-2 text-left font-display text-xl">
                <Users className="h-5 w-5 text-violet" />
                Qui veut emménager ?
              </p>
              <Link
                href="/mon-annonce"
                title="Gérer mon annonce"
                aria-label="Gérer mon annonce"
                className="flex h-9 items-center gap-1.5 rounded-full bg-panel px-3 text-xs font-medium text-ink/70 hover:bg-panel-2"
              >
                <Home className="h-4 w-4" /> Mon annonce
              </Link>
            </div>
            <ProfileSwipeDeck listingId={listing.id} />
            {/* Message d'accueil annonceur (1×/session) */}
            <AccrocheAnnonceur />
          </div>
        )}
      </div>
    </main>
  );
}
