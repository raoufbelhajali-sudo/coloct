"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, Eye, ArrowLeft, Pencil } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingForm from "@/components/ListingForm";
import ListingDetail from "@/components/ListingDetail";
import { useAuth } from "@/lib/auth";
import { getMyListing } from "@/lib/locataire";
import { lieuComplet } from "@/lib/listings";
import { boostActif, activerBoostAnnonce } from "@/lib/offers";
import type { Listing } from "@/data/listings";

export default function MonAnnoncePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);
  const [boostEnCours, setBoostEnCours] = useState(false);
  const [edition, setEdition] = useState(false);
  const [apercu, setApercu] = useState(false);

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

  async function booster() {
    if (!listing) return;
    setBoostEnCours(true);
    await activerBoostAnnonce(listing.id);
    await chargerAnnonce();
    setBoostEnCours(false);
  }

  const retour = "/locataire";

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-28 pt-6">
      <AppHeader hideTop />

      {/* En-tête de page */}
      <header className="mb-5 flex w-full max-w-md items-center gap-3">
        <Link href={retour} aria-label="Retour" className="text-ink/60 hover:text-ink">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">Mon annonce</h1>
      </header>

      <div className="w-full max-w-md">
        {chargement ? (
          <p className="mt-10 text-center text-ink/60">Chargement…</p>
        ) : !listing ? (
          // Pas encore d'annonce → création
          <>
            <p className="mb-6 text-ink/60">
              Publie ta chambre pour qu&apos;elle apparaisse auprès des
              colocataires.
            </p>
            <ListingForm onCreated={chargerAnnonce} />
          </>
        ) : edition ? (
          // Modification
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Modifier l&apos;annonce
              </h2>
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
          </>
        ) : (
          // Vue de gestion
          <>
            <div className="rounded-2xl bg-panel p-5">
              <p className="text-xs text-ink/50">Ton annonce</p>
              <p className="font-display text-2xl">{lieuComplet(listing)}</p>
              <p className="mt-1 text-sm text-ink/70">
                {listing.loyer} € / mois · {listing.surface} m²
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setApercu(true)}
                  className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-3 text-sm font-medium text-ink/80 hover:border-ink/30"
                >
                  <Eye className="h-4 w-4" /> Voir
                </button>
                <button
                  onClick={() => setEdition(true)}
                  className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-3 text-sm font-medium text-pink hover:border-pink/40"
                >
                  <Pencil className="h-4 w-4" /> Modifier
                </button>
              </div>

              {/* Boost */}
              {boostActif(listing.boosted_until) ? (
                <p className="mt-3 flex items-center justify-center gap-2 rounded-full bg-panel-2 px-4 py-2.5 text-sm font-semibold text-pink">
                  <Rocket className="h-4 w-4" /> Annonce mise en avant
                </p>
              ) : (
                <button
                  onClick={booster}
                  disabled={boostEnCours}
                  className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {boostEnCours ? "Activation…" : "Booster mon annonce (48h)"}
                </button>
              )}
            </div>

            <Link
              href="/locataire"
              className="mt-4 flex w-full items-center justify-center rounded-full bg-panel px-4 py-3 text-sm font-medium text-ink/70 hover:bg-panel-2"
            >
              Voir les candidats →
            </Link>
          </>
        )}
      </div>

      {/* Aperçu de l'annonce (comme la voient les colocataires) */}
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
