"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, Eye, ArrowLeft, Pencil, Snowflake, CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingForm from "@/components/ListingForm";
import ListingDetail from "@/components/ListingDetail";
import { useAuth } from "@/lib/auth";
import { getMyListing, setListingGelee, getStatsAnnonce } from "@/lib/locataire";
import { lieuComplet } from "@/lib/listings";
import { boostActif, activerBoostAnnonce } from "@/lib/offers";
import type { Listing } from "@/data/listings";

export default function MonAnnoncePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);
  const [boostEnCours, setBoostEnCours] = useState(false);
  const [gelEnCours, setGelEnCours] = useState(false);
  const [edition, setEdition] = useState(false);
  const [apercu, setApercu] = useState(false);
  const [stats, setStats] = useState<{ likes: number; matchs: number; favoris: number } | null>(null);

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
    if (l) setStats(await getStatsAnnonce(l.id));
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

  // Gèle (bien loué) ou réactive l'annonce
  async function basculerGel() {
    if (!listing) return;
    setGelEnCours(true);
    await setListingGelee(listing.id, !listing.gelee);
    await chargerAnnonce();
    setGelEnCours(false);
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

              {/* Statistiques */}
              {stats && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-panel-2 py-2">
                    <p className="font-display text-xl font-bold text-pink">{stats.likes}</p>
                    <p className="text-[11px] text-ink/55">J&apos;aime reçus</p>
                  </div>
                  <div className="rounded-xl bg-panel-2 py-2">
                    <p className="font-display text-xl font-bold text-pink">{stats.matchs}</p>
                    <p className="text-[11px] text-ink/55">Matchs</p>
                  </div>
                  <div className="rounded-xl bg-panel-2 py-2">
                    <p className="font-display text-xl font-bold text-violet">{stats.favoris}</p>
                    <p className="text-[11px] text-ink/55">Favoris</p>
                  </div>
                </div>
              )}

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

              {listing.gelee ? (
                // Annonce gelée (bien loué)
                <>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-bleu-clair px-4 py-3 text-sm font-medium text-violet">
                    <Snowflake className="h-4 w-4 shrink-0" /> Annonce gelée — ton
                    bien est loué. Elle n&apos;apparaît plus aux colocataires.
                  </div>
                  <button
                    onClick={basculerGel}
                    disabled={gelEnCours}
                    className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {gelEnCours ? "…" : "Réactiver mon annonce"}
                  </button>
                </>
              ) : (
                <>
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
                  {/* Geler (bien loué) */}
                  <button
                    onClick={basculerGel}
                    disabled={gelEnCours}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-3 text-sm font-medium text-ink/70 transition-colors hover:border-ink/30 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {gelEnCours ? "…" : "J'ai loué mon bien — geler l'annonce"}
                  </button>
                </>
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
