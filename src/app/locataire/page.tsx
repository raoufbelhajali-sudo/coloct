"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Snowflake } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ProfileSwipeDeck from "@/components/ProfileSwipeDeck";
import AccrocheAnnonceur from "@/components/AccrocheAnnonceur";
import RappelProfil from "@/components/RappelProfil";
import { useAuth } from "@/lib/auth";
import { getMyListings } from "@/lib/locataire";
import { lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

export default function LocatairePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/connexion");
    else if (profile && profile.role !== "locataire") router.replace("/swipe");
  }, [loading, user, profile, router]);

  const charger = useCallback(async () => {
    if (!user) return;
    setChargement(true);
    const liste = await getMyListings(user.id);
    setListings(liste);
    // Sélection par défaut : la 1re annonce active (non gelée), sinon la 1re
    setSelectedId((prec) => {
      if (prec && liste.some((l) => l.id === prec)) return prec;
      const active = liste.find((l) => !l.gelee) ?? liste[0];
      return active ? active.id : null;
    });
    setChargement(false);
  }, [user]);

  useEffect(() => {
    if (user) charger();
  }, [user, charger]);

  const selected =
    listings.find((l) => l.id === selectedId) ?? listings[0] ?? null;

  return (
    <main className="relative flex h-dvh flex-col items-center overflow-hidden px-0 pb-16 pt-5 sm:px-4">
      <AppHeader />

      {/* Sélecteur d'annonce (visible seulement si plusieurs annonces) */}
      {!chargement && listings.length > 1 && (
        <div className="mb-3 w-full max-w-sm px-4 sm:px-0">
          <label className="mb-1 block text-xs font-medium text-ink/55">
            Tu recrutes pour&nbsp;:
          </label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-full border border-ink/15 bg-panel px-4 py-2.5 text-sm font-medium text-ink focus:border-pink focus:outline-none"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {(l.titre || lieuComplet(l)) + " · " + l.loyer + "€"}
                {l.gelee ? " (gelée)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex w-full min-h-0 flex-1 flex-col items-center">
        {chargement ? (
          <p className="mt-20 text-ink/60">Chargement…</p>
        ) : listings.length === 0 ? (
          // Aucune annonce → invite à en créer une
          <div className="m-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Home className="h-12 w-12 text-bleu" />
            <p className="font-display text-2xl">Crée ton annonce</p>
            <p className="text-sm text-ink/70">
              Publie ta chambre pour voir les co/locataires intéressés et commencer
              à matcher.
            </p>
            <Link
              href="/mon-annonce"
              className="bg-metal glow-pink rounded-full px-6 py-3 font-semibold text-white"
            >
              Décrire mon bien
            </Link>
          </div>
        ) : selected && selected.gelee ? (
          // L'annonce sélectionnée est gelée
          <div className="m-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Snowflake className="h-12 w-12 text-violet" />
            <p className="font-display text-2xl">Annonce gelée</p>
            <p className="text-sm text-ink/70">
              Cette annonce est masquée (bien loué). Réactive-la, ou choisis une
              autre annonce ci-dessus.
            </p>
            <Link
              href="/mon-annonce"
              className="bg-metal rounded-full px-6 py-3 font-semibold text-white"
            >
              Gérer mes annonces
            </Link>
          </div>
        ) : selected ? (
          // On swipe les colocataires pour l'annonce sélectionnée
          <div className="flex min-h-0 w-full max-w-none flex-1 flex-col sm:max-w-sm">
            <ProfileSwipeDeck
              key={selected.id}
              listingId={selected.id}
              typeOffre={selected.typeOffre ?? "colocation"}
            />
            <AccrocheAnnonceur />
          </div>
        ) : null}
      </div>

      <RappelProfil />
    </main>
  );
}
