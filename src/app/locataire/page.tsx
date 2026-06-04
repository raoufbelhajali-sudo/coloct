"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Rocket, Eye } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingForm from "@/components/ListingForm";
import ListingDetail from "@/components/ListingDetail";
import ProfileSwipeDeck from "@/components/ProfileSwipeDeck";
import { useAuth } from "@/lib/auth";
import { getMyListing } from "@/lib/locataire";
import { lieuComplet } from "@/lib/listings";
import { boostActif, activerBoostAnnonce } from "@/lib/offers";
import type { Listing } from "@/data/listings";

export default function LocatairePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);
  const [boostEnCours, setBoostEnCours] = useState(false);
  const [edition, setEdition] = useState(false);
  const [apercu, setApercu] = useState(false);

  // Pas connecté → connexion ; colocataire → son espace de swipe
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/connexion");
    else if (profile && profile.role !== "locataire") router.replace("/swipe");
  }, [loading, user, profile, router]);

  const chargerAnnonce = useCallback(async () => {
    if (!user) return;
    setChargement(true);
    const l = await getMyListing(user.id);
    setListing(l);
    setChargement(false);
  }, [user]);

  useEffect(() => {
    if (user) chargerAnnonce();
  }, [user, chargerAnnonce]);

  // Booste l'annonce 48h (démo) puis recharge
  async function booster() {
    if (!listing) return;
    setBoostEnCours(true);
    await activerBoostAnnonce(listing.id);
    await chargerAnnonce();
    setBoostEnCours(false);
  }

  return (
    <main className="flex h-dvh flex-col items-center overflow-hidden px-4 py-4">
      <AppHeader />

      <div className="flex w-full min-h-0 flex-1 flex-col items-center">
        {chargement ? (
          <p className="mt-20 text-ink/60">Chargement…</p>
        ) : !listing ? (
          // Pas encore d'annonce → on la crée (formulaire défilable)
          <div className="h-full w-full max-w-md overflow-y-auto pb-8">
            <h1 className="font-display text-3xl font-semibold">Décris ton bien</h1>
            <p className="mt-1 mb-6 text-ink/60">
              Publie ta chambre pour qu&apos;elle apparaisse auprès des
              colocataires.
            </p>
            <ListingForm onCreated={chargerAnnonce} />
          </div>
        ) : edition ? (
          // Modification de l'annonce (formulaire pré-rempli)
          <div className="h-full w-full max-w-md overflow-y-auto pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-display text-2xl font-semibold">
                Modifier ton annonce
              </h1>
              <button
                onClick={() => setEdition(false)}
                className="text-sm text-ink/60 hover:text-ink"
              >
                Annuler
              </button>
            </div>
            <ListingForm
              listing={listing}
              onCreated={() => {
                setEdition(false);
                chargerAnnonce();
              }}
            />
          </div>
        ) : (
          // Annonce publiée → on swipe sur les colocataires
          <div className="flex h-full w-full max-w-sm flex-col">
            <div className="mb-3 w-full rounded-2xl bg-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-ink/50">Ton annonce</p>
                  <p className="font-display text-xl">{lieuComplet(listing)}</p>
                  <p className="text-sm text-ink/70">
                    {listing.loyer} € / mois · {listing.surface} m²
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    onClick={() => setApercu(true)}
                    className="flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink"
                  >
                    <Eye className="h-4 w-4" /> Voir
                  </button>
                  <button
                    onClick={() => setEdition(true)}
                    className="text-sm font-medium text-pink hover:underline"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              {/* Boost de l'annonce */}
              {boostActif(listing.boosted_until) ? (
                <p className="mt-3 flex items-center gap-2 rounded-full bg-panel-2 px-4 py-2 text-sm font-semibold text-pink">
                  <Rocket className="h-4 w-4" /> Annonce mise en avant
                </p>
              ) : (
                <button
                  onClick={booster}
                  disabled={boostEnCours}
                  className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {boostEnCours ? "Activation…" : "Booster mon annonce (48h)"}
                </button>
              )}
            </div>

            <p className="mb-3 flex w-full items-center gap-2 text-left font-display text-xl">
              <Users className="h-5 w-5 text-violet" />
              Qui veut emménager ?
            </p>
            <ProfileSwipeDeck listingId={listing.id} />
          </div>
        )}
      </div>

      {/* Aperçu de mon annonce (telle que les colocataires la voient) */}
      {apercu && listing && (
        <ListingDetail
          listing={listing}
          preview
          onClose={() => setApercu(false)}
        />
      )}
    </main>
  );
}
