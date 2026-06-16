"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Rocket,
  Eye,
  ArrowLeft,
  Pencil,
  Snowflake,
  CheckCircle2,
  Plus,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingForm from "@/components/ListingForm";
import ListingDetail from "@/components/ListingDetail";
import { useAuth } from "@/lib/auth";
import { getMyListings, setListingGelee, getStatsAnnonce } from "@/lib/locataire";
import { lieuComplet } from "@/lib/listings";
import { boostActif, activerBoostAnnonce, estSuperAnnonceur } from "@/lib/offers";
import type { Listing } from "@/data/listings";

type Stats = { likes: number; matchs: number; favoris: number };
type Mode = "liste" | "creer" | "editer";

export default function MonAnnoncePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, Stats>>({});
  const [chargement, setChargement] = useState(true);
  const [mode, setMode] = useState<Mode>("liste");
  const [selection, setSelection] = useState<Listing | null>(null);
  const [apercu, setApercu] = useState<Listing | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [paywallSuper, setPaywallSuper] = useState(false);

  // Entreprise/agence : 1ʳᵉ annonce gratuite, les suivantes → Super Annonceur.
  function ajouterAnnonce() {
    if (
      profile?.est_agence &&
      listings.length >= 1 &&
      !estSuperAnnonceur(profile)
    ) {
      setPaywallSuper(true);
      return;
    }
    setMode("creer");
  }

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
    const stats: Record<string, Stats> = {};
    await Promise.all(
      liste.map(async (l) => {
        stats[l.id] = await getStatsAnnonce(l.id);
      })
    );
    setStatsMap(stats);
    setChargement(false);
  }, [user]);

  useEffect(() => {
    if (user) charger();
  }, [user, charger]);

  async function booster(l: Listing) {
    setBusyId(l.id);
    await activerBoostAnnonce(l.id);
    await charger();
    setBusyId(null);
  }

  async function basculerGel(l: Listing) {
    setBusyId(l.id);
    await setListingGelee(l.id, !l.gelee);
    await charger();
    setBusyId(null);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-28 pt-5">
      <AppHeader />

      <div className="w-full max-w-md">
        <h1 className="mb-5 font-display text-3xl font-bold">
          {mode === "creer"
            ? "Nouvelle annonce"
            : mode === "editer"
              ? "Modifier l'annonce"
              : "Mes annonces"}
        </h1>
        {chargement ? (
          <p className="mt-10 text-center text-ink/60">Chargement…</p>
        ) : mode === "creer" ? (
          <>
            <p className="mb-6 text-ink/60">
              Publie une chambre pour qu&apos;elle apparaisse auprès des
              colocataires.
            </p>
            <ListingForm
              onCreated={() => {
                setMode("liste");
                charger();
              }}
            />
            <button
              onClick={() => setMode("liste")}
              className="mt-4 w-full text-center text-sm text-ink/60 hover:underline"
            >
              Annuler
            </button>
          </>
        ) : mode === "editer" && selection ? (
          <>
            <ListingForm
              listing={selection}
              onCreated={() => {
                setMode("liste");
                setSelection(null);
                charger();
              }}
            />
            <button
              onClick={() => {
                setMode("liste");
                setSelection(null);
              }}
              className="mt-4 w-full text-center text-sm text-ink/60 hover:underline"
            >
              Annuler
            </button>
          </>
        ) : (
          // ----- Liste des annonces -----
          <>
            {/* Bouton ajouter */}
            <button
              onClick={ajouterAnnonce}
              className="bg-signature glow-pink mb-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" /> Ajouter une annonce
            </button>

            {listings.length === 0 ? (
              <p className="mt-6 text-center text-ink/60">
                Tu n&apos;as pas encore d&apos;annonce. Clique sur «&nbsp;Ajouter
                une annonce&nbsp;» pour publier ta première chambre.
              </p>
            ) : (
              <div className="space-y-4">
                {listings.map((l) => {
                  const stats = statsMap[l.id];
                  const occupe = busyId === l.id;
                  return (
                    <div key={l.id} className="rounded-2xl bg-panel p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-xl">
                            {l.titre || lieuComplet(l)}
                          </p>
                          <p className="mt-0.5 text-sm text-ink/70">
                            {lieuComplet(l)} · {l.loyer} € / mois · {l.surface}{" "}
                            m²
                          </p>
                        </div>
                        {l.gelee ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-bleu-clair px-2.5 py-1 text-xs font-medium text-violet">
                            <Snowflake className="h-3 w-3" /> Gelée
                          </span>
                        ) : boostActif(l.boosted_until) ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-panel-2 px-2.5 py-1 text-xs font-medium text-pink">
                            <Rocket className="h-3 w-3" /> En avant
                          </span>
                        ) : null}
                      </div>

                      {stats && (
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-xl bg-panel-2 py-2">
                            <p className="font-display text-lg font-bold text-pink">
                              {stats.likes}
                            </p>
                            <p className="text-[11px] text-ink/55">J&apos;aime</p>
                          </div>
                          <div className="rounded-xl bg-panel-2 py-2">
                            <p className="font-display text-lg font-bold text-pink">
                              {stats.matchs}
                            </p>
                            <p className="text-[11px] text-ink/55">Matchs</p>
                          </div>
                          <div className="rounded-xl bg-panel-2 py-2">
                            <p className="font-display text-lg font-bold text-violet">
                              {stats.favoris}
                            </p>
                            <p className="text-[11px] text-ink/55">Favoris</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setApercu(l)}
                          className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-2.5 text-sm font-medium text-ink/80 hover:border-ink/30"
                        >
                          <Eye className="h-4 w-4" /> Voir
                        </button>
                        <button
                          onClick={() => {
                            setSelection(l);
                            setMode("editer");
                          }}
                          className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-2.5 text-sm font-medium text-pink hover:border-pink/40"
                        >
                          <Pencil className="h-4 w-4" /> Modifier
                        </button>
                      </div>

                      {l.gelee ? (
                        <button
                          onClick={() => basculerGel(l)}
                          disabled={occupe}
                          className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                        >
                          {occupe ? "…" : "Réactiver cette annonce"}
                        </button>
                      ) : (
                        <>
                          {!boostActif(l.boosted_until) && (
                            <button
                              onClick={() => booster(l)}
                              disabled={occupe}
                              className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                            >
                              <Rocket className="h-4 w-4" />
                              {occupe ? "Activation…" : "Booster (48h)"}
                            </button>
                          )}
                          <button
                            onClick={() => basculerGel(l)}
                            disabled={occupe}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel-2 px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/30 disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {occupe ? "…" : "Louée — geler"}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                <Link
                  href="/locataire"
                  className="flex w-full items-center justify-center rounded-full bg-panel px-4 py-3 text-sm font-medium text-ink/70 hover:bg-panel-2"
                >
                  Voir les intéressés →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Aperçu (comme la voient les colocataires) */}
      {apercu && (
        <ListingDetail listing={apercu} preview onClose={() => setApercu(null)} />
      )}

      {/* Entreprise : popup pour publier une 2ᵉ annonce (Super Annonceur) */}
      {paywallSuper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-7 text-center">
            <span className="bg-signature mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-white">
              <Rocket className="h-7 w-7" />
            </span>
            <p className="font-display text-2xl font-bold leading-tight">
              Passe en Super Annonceur
            </p>
            <p className="mt-3 text-ink/80">
              Ta 1ʳᵉ annonce est gratuite. Pour publier{" "}
              <strong>plusieurs annonces</strong>, passe en{" "}
              <span className="text-signature font-semibold">Super Annonceur</span>{" "}
              — <strong>5,99 €/semaine</strong>, sans engagement.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/boutique")}
                className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
              >
                Voir l&apos;offre Super Annonceur
              </button>
              <button
                onClick={() => setPaywallSuper(false)}
                className="rounded-full px-6 py-3 font-medium text-ink/70 hover:text-ink"
              >
                Plus tard
              </button>
            </div>
            <p className="mt-2 text-xs text-ink/40">
              Paiement à venir — déblocage de démo pour l&apos;instant.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
