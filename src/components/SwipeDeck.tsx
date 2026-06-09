"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Star, Eye, Rocket, SlidersHorizontal, Share2, RotateCcw, Bookmark } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import type { Listing } from "@/data/listings";
import { getListings, lieuComplet } from "@/lib/listings";
import { compatAnnonce } from "@/lib/compat";
import { getIdsBloques } from "@/lib/blocks";
import { geocodeVille, distanceKm, type Coord } from "@/lib/geo";
import { partagerAnnonce } from "@/lib/partage";
import InviterAmis from "@/components/InviterAmis";
import { useAuth } from "@/lib/auth";
import { estPremium, estHero, contacterDirect } from "@/lib/offers";
import { vibrer, vibrerSucces, ImpactStyle } from "@/lib/haptics";
import {
  getSwipedListingIds,
  recordListingSwipe,
  annulerSwipeListing,
  getLikesToday,
  getBonusLikes,
  getMatchIdForListing,
} from "@/lib/swipes";
import {
  getFavorisIds,
  ajouterFavori,
  retirerFavori,
} from "@/lib/favoris";
import Link from "next/link";
import { marquerAnnonce } from "@/lib/matchPopup";
import ListingCard from "./ListingCard";
import ListingDetail from "./ListingDetail";

type Direction = "left" | "right";

// Bornes de budget pour le curseur
const BUDGET_MIN = 500;
const BUDGET_MAX = 900;

// Borne du filtre distance (au max = pas de limite, "toute la France")
const DIST_MAX = 200;

// Nombre de "j'aime" gratuits par jour
const LIKES_GRATUITS_PAR_JOUR = 10;

export default function SwipeDeck() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [match, setMatch] = useState<Listing | null>(null);
  const [likes, setLikes] = useState<Listing[]>([]); // annonces aimées
  // Annonces déjà swipées (on les retire du paquet au fur et à mesure)
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  // Annonces chargées depuis le serveur Supabase
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [bloques, setBloques] = useState<Set<string>>(new Set());
  const [bonusLikes, setBonusLikes] = useState(0);
  const [dernierSwipe, setDernierSwipe] = useState<
    { id: string; direction: "like" | "pass"; superLike: boolean } | null
  >(null);
  const [favorisIds, setFavorisIds] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // Likes gratuits du jour
  const [likesAujourdhui, setLikesAujourdhui] = useState(0);
  const [paywall, setPaywall] = useState(false); // écran "limite atteinte"
  const [detail, setDetail] = useState<Listing | null>(null); // annonce ouverte en grand
  const [filtresOuverts, setFiltresOuverts] = useState(false); // panneau filtres replié par défaut

  // Offre de lancement : tout gratuit pour le moment (web + app)
  const lancement = true;

  // Pass Express actif ? (likes illimités), lu depuis le compte
  const premium = estPremium(profile);

  // --- Filtres ---
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX);
  const [quartier, setQuartier] = useState("all");
  const [dispoAvant, setDispoAvant] = useState(""); // "" = pas de filtre date
  const [maxDistance, setMaxDistance] = useState(DIST_MAX); // DIST_MAX = pas de limite
  const [coordChercheur, setCoordChercheur] = useState<Coord | null>(null);

  // Pas connecté → direction la page de connexion
  useEffect(() => {
    if (!authLoading && !user) router.replace("/connexion");
  }, [authLoading, user, router]);

  // Au chargement : annonces depuis Supabase + annonces déjà swipées par ce compte
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getListings(),
      getSwipedListingIds(user.id),
      getLikesToday(user.id),
      getIdsBloques(user.id),
      getFavorisIds(user.id),
    ])
      .then(([data, swiped, likes, blocs, favs]) => {
        setAllListings(data);
        setSwipedIds(swiped);
        setLikesAujourdhui(likes);
        setBloques(blocs);
        setFavorisIds(favs);
        setBonusLikes(getBonusLikes(user.id));
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [user]);

  // On pré-remplit les filtres depuis le profil du compte connecté
  useEffect(() => {
    if (!profile) return;
    if (profile.budget_max) {
      const v = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, profile.budget_max));
      setBudgetMax(v);
    }
    if (profile.date_emmenagement) setDispoAvant(profile.date_emmenagement);
  }, [profile]);

  // Coordonnées de la ville recherchée par le chercheur (pour le filtre distance)
  useEffect(() => {
    if (!profile?.ville) {
      setCoordChercheur(null);
      return;
    }
    let actif = true;
    geocodeVille(profile.ville, profile.departement ?? undefined).then((c) => {
      if (actif) setCoordChercheur(c);
    });
    return () => {
      actif = false;
    };
  }, [profile?.ville, profile?.departement]);

  // Liste des quartiers présents dans les annonces (pour le menu déroulant)
  const quartiers = useMemo(
    () => Array.from(new Set(allListings.map((l) => l.quartier))).sort(),
    [allListings]
  );

  // Annonces qui passent les filtres (et pas encore swipées)
  const filtered = useMemo(() => {
    return allListings.filter((l) => {
      if (swipedIds.has(l.id)) return false;
      if (l.ownerId && bloques.has(l.ownerId)) return false; // annonceur bloqué
      if (l.loyer > budgetMax) return false;
      if (quartier !== "all" && l.quartier !== quartier) return false;
      if (dispoAvant && l.dispo > dispoAvant) return false;
      // Filtre distance : seulement si une limite est posée, le chercheur est
      // localisé et l'annonce a des coordonnées (sinon on ne masque pas).
      if (
        maxDistance < DIST_MAX &&
        coordChercheur &&
        l.lat != null &&
        l.lng != null &&
        distanceKm(coordChercheur, { lat: l.lat, lng: l.lng }) > maxDistance
      )
        return false;
      return true;
    });
  }, [
    allListings,
    swipedIds,
    bloques,
    budgetMax,
    quartier,
    dispoAvant,
    maxDistance,
    coordChercheur,
  ]);

  // Position horizontale de la carte du dessus (pour le glissement)
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -40], [1, 0]);
  const controls = useAnimationControls();
  const animating = useRef(false);

  // La carte du dessus est toujours la première du paquet filtré
  const current = filtered[0];
  const next = filtered[1];

  // Quand on change un filtre : on remet la carte droite
  function resetDeck() {
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
  }

  // Limite du jour = likes gratuits + swipes bonus (parrainage)
  const limiteJour = LIKES_GRATUITS_PAR_JOUR + bonusLikes;
  // A-t-on encore des likes gratuits aujourd'hui ?
  const likesEpuises = !premium && likesAujourdhui >= limiteJour;
  // Au-delà de la limite (sans Pass) : on masque (floute) les annonces
  const flou = likesEpuises;

  // Fait voler la carte hors de l'écran puis passe à la suivante
  async function fly(dir: Direction, superLike = false) {
    if (animating.current || !current || !user) return;

    // Limite de likes gratuits : on bloque le "j'aime" et on propose FlatSwiper+
    if (dir === "right" && likesEpuises) {
      setPaywall(true);
      return;
    }

    animating.current = true;
    const swiped = current; // on retient l'annonce avant d'avancer la pile

    // Vibration tactile immédiate (plus marquée pour un like)
    vibrer(dir === "right" ? ImpactStyle.Medium : ImpactStyle.Light);

    await controls.start({
      x: dir === "right" ? 700 : -700,
      opacity: 0,
      transition: { duration: 0.35 },
    });

    // on retire l'annonce du paquet (la suivante passe devant)
    setSwipedIds((prev) => new Set(prev).add(swiped.id));
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    animating.current = false;

    // puis on enregistre le swipe sur le serveur
    const direction = dir === "right" ? "like" : "pass";
    setDernierSwipe({ id: swiped.id, direction, superLike });
    try {
      await recordListingSwipe(user.id, swiped.id, direction, superLike);
      if (direction === "like") {
        setLikes((prev) => [...prev, swiped]);
        setLikesAujourdhui((n) => n + 1);
        // match seulement si le locataire t'a aussi liké
        const mid = await getMatchIdForListing(user.id, swiped.id);
        if (mid) {
          vibrerSucces(); // c'est un match !
          setMatch(swiped);
          marquerAnnonce(user.id, mid); // évite la double pop-up globale
        }
      }
    } catch {
      // souci réseau : on n'interrompt pas le swipe
    }
  }

  // Annule le dernier swipe (revient en arrière) — réservé HeroSwiper
  async function annulerDernier() {
    if (!user || !dernierSwipe || animating.current) return;
    if (!estHero(profile)) {
      router.push("/boutique"); // fonctionnalité HeroSwiper
      return;
    }
    const { id, direction } = dernierSwipe;
    setDernierSwipe(null);
    setSwipedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (direction === "like") {
      setLikes((prev) => prev.filter((l) => l.id !== id));
      setLikesAujourdhui((n) => Math.max(0, n - 1));
    }
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    try {
      await annulerSwipeListing(user.id, id);
    } catch {
      /* réseau */
    }
  }

  // Message direct à l'annonceur SANS attendre un match — réservé HeroSwiper
  const [contactEnCours, setContactEnCours] = useState(false);
  async function messageDirect() {
    if (!user || !current || contactEnCours) return;
    if (!estHero(profile)) {
      router.push("/boutique"); // fonctionnalité HeroSwiper
      return;
    }
    setContactEnCours(true);
    try {
      const mid = await contacterDirect(current.id);
      if (mid) router.push(`/matchs/conversation/?id=${mid}`);
    } finally {
      setContactEnCours(false);
    }
  }

  // Ajoute / retire l'annonce courante des favoris
  async function basculerFavori() {
    if (!user || !current) return;
    const id = current.id;
    const estFav = favorisIds.has(id);
    setFavorisIds((prev) => {
      const n = new Set(prev);
      if (estFav) n.delete(id);
      else n.add(id);
      return n;
    });
    try {
      if (estFav) await retirerFavori(user.id, id);
      else await ajouterFavori(user.id, id);
    } catch {
      /* réseau */
    }
  }

  function handleDragEnd(
    _e: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) {
    if (info.offset.x > 120 || info.velocity.x > 600) fly("right");
    else if (info.offset.x < -120 || info.velocity.x < -600) fly("left");
    else controls.start({ x: 0, transition: { type: "spring", stiffness: 300 } });
  }

  // Pendant le chargement des annonces depuis le serveur
  if (chargement) {
    return (
      <div className="flex h-[480px] items-center justify-center text-ink/60">
        Chargement des colocations…
      </div>
    );
  }

  // En cas de problème de connexion au serveur
  if (erreur) {
    return (
      <div className="flex h-[480px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-2xl">Oups…</p>
        <p className="max-w-xs text-sm text-ink/70">
          Impossible de charger les annonces depuis le serveur. Vérifie ta
          connexion et réessaie.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-sm flex-col">
      {/* Rôle + compteur de likes restants + bouton filtres (même ligne) */}
      <div className="mb-4 flex h-9 w-full items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-full.png" alt="FlatSwiper" className="h-6 w-auto shrink-0" />
        <div className="ml-auto flex items-center gap-2">
        {!premium && (likesEpuises ? (
          // Likes épuisés → on retire le compteur et on invite au Pass
          <Link
            href="/boutique"
            className="bg-signature inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white"
          >
            <Star className="h-4 w-4" fill="currentColor" /> Passe au Pass
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 text-sm font-semibold"
            title="Likes gratuits restants aujourd'hui"
          >
            <Heart className="h-4 w-4 text-bleu" fill="currentColor" />
            <span className="text-pink">
              {Math.max(0, limiteJour - likesAujourdhui)}
            </span>
            <span className="text-xs font-normal text-ink/40">
              / {limiteJour} likes
            </span>
          </span>
        ))}
        <button
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-label="Filtres"
          title="Filtres"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-bleu"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          {(budgetMax !== BUDGET_MAX || quartier !== "all" || !!dispoAvant || maxDistance < DIST_MAX) && (
            <span className="bg-signature absolute right-1.5 top-1.5 h-2 w-2 rounded-full" />
          )}
        </button>
        {current && (
          <button
            onClick={() => partagerAnnonce(current)}
            aria-label="Partager"
            title="Partager"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-bleu"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        )}
        </div>
      </div>

      {/* ---------- Filtres (pop-up) ---------- */}
      {filtresOuverts && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setFiltresOuverts(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-panel p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-xl font-semibold">Filtres</p>
              <button
                onClick={() => setFiltresOuverts(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-panel-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Budget max */}
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="budget" className="text-ink/70">
                Budget max
              </label>
              <span className="font-semibold text-pink">{budgetMax} € / mois</span>
            </div>
            <input
              id="budget"
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={10}
              value={budgetMax}
              onChange={(e) => {
                setBudgetMax(Number(e.target.value));
                resetDeck();
              }}
              className="accent-pink mt-2 w-full"
            />

            {/* Distance */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <label htmlFor="distance" className="text-ink/70">
                Distance max
              </label>
              <span className="font-semibold text-pink">
                {maxDistance >= DIST_MAX
                  ? "Toute la France"
                  : `${maxDistance} km`}
              </span>
            </div>
            <input
              id="distance"
              type="range"
              min={5}
              max={DIST_MAX}
              step={5}
              value={maxDistance}
              onChange={(e) => {
                setMaxDistance(Number(e.target.value));
                resetDeck();
              }}
              className="accent-pink mt-2 w-full"
            />
            {!coordChercheur && maxDistance < DIST_MAX && (
              <p className="mt-1 text-xs text-ink/40">
                Renseigne ta ville recherchée (dans ton profil) pour activer le
                filtre par distance.
              </p>
            )}

            {/* Quartier + date */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <label htmlFor="quartier" className="text-ink/70">
                  Quartier
                </label>
                <select
                  id="quartier"
                  value={quartier}
                  onChange={(e) => {
                    setQuartier(e.target.value);
                    resetDeck();
                  }}
                  className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-2 py-2 text-ink"
                >
                  <option value="all">Tous</option>
                  {quartiers.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dispo" className="text-ink/70">
                  Dispo avant le
                </label>
                <input
                  id="dispo"
                  type="date"
                  value={dispoAvant}
                  onChange={(e) => {
                    setDispoAvant(e.target.value);
                    resetDeck();
                  }}
                  className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-2 py-2 text-ink"
                />
              </div>
            </div>

            {(budgetMax !== BUDGET_MAX ||
              quartier !== "all" ||
              dispoAvant ||
              maxDistance < DIST_MAX) && (
              <button
                onClick={() => {
                  setBudgetMax(BUDGET_MAX);
                  setQuartier("all");
                  setDispoAvant("");
                  setMaxDistance(DIST_MAX);
                  resetDeck();
                }}
                className="mt-3 text-sm text-pink-light hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}

            <button
              onClick={() => setFiltresOuverts(false)}
              className="bg-signature glow-pink mt-5 w-full rounded-full px-6 py-3 font-semibold text-white"
            >
              Voir les {filtered.length} annonce{filtered.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Zone des cartes ---------- */}
      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-3xl">C&apos;est tout pour l&apos;instant !</p>
          <p className="max-w-xs text-sm text-ink/70">
            Tu as parcouru toutes les colocations disponibles. Ajuste tes filtres
            ou reviens bientôt, de nouvelles annonces arrivent.
          </p>
          {likes.length > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-pink-light">
              <Heart className="h-4 w-4" fill="currentColor" />
              {likes.length} annonce{likes.length > 1 ? "s" : ""} aimée
              {likes.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Pile de cartes (remplit l'écran) */}
          <div className="relative w-full flex-1 min-h-0">
            {next && (
              <div className="absolute inset-0 scale-95 opacity-60">
                <ListingCard
                  listing={next}
                  compat={compatAnnonce(profile, next)}
                  flou={flou}
                />
              </div>
            )}

            <motion.div
              key={current.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              onTap={() => (flou ? setPaywall(true) : setDetail(current))}
              style={{ x, rotate }}
              animate={controls}
            >
              <motion.div
                style={{ opacity: likeOpacity }}
                className="bg-signature absolute top-10 left-6 z-10 -rotate-12 rounded-xl px-4 py-2 text-lg font-extrabold text-white"
              >
                ÇA M&apos;INTÉRESSE
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute top-10 right-6 z-10 rotate-12 rounded-xl border-2 border-ink/70 px-4 py-2 text-lg font-extrabold text-ink"
              >
                JE PASSE
              </motion.div>

              <ListingCard
                listing={current}
                compat={compatAnnonce(profile, current)}
                flou={flou}
              />
            </motion.div>

            {/* Bouton favori (signet) — posé sur la carte, hors zone de swipe */}
            {!flou && current && (
              <button
                onClick={basculerFavori}
                aria-label="Mettre en favori"
                title="Mettre en favori"
                className="absolute right-4 top-16 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-bg/80 text-violet shadow-md backdrop-blur-sm transition-transform hover:scale-110"
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={favorisIds.has(current.id) ? "currentColor" : "none"}
                />
              </button>
            )}

            {/* Boutons posés sur la carte */}
            <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-4">
              <button
                onClick={annulerDernier}
                disabled={!dernierSwipe}
                aria-label="Annuler le dernier swipe"
                title="Annuler"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-bg/90 text-ink/50 shadow-lg backdrop-blur transition-transform hover:scale-110 disabled:opacity-40"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={() => fly("left")}
                aria-label="Je passe"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-bg/90 text-ink/60 shadow-lg backdrop-blur transition-transform hover:scale-110"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button
                onClick={messageDirect}
                disabled={contactEnCours}
                aria-label="Message direct (HeroSwiper)"
                title="Message direct à l'annonceur (HeroSwiper)"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/10 bg-bg/90 text-bleu shadow-lg backdrop-blur transition-transform hover:scale-110 disabled:opacity-60"
              >
                <Star className="h-6 w-6" fill="currentColor" />
              </button>
              <button
                onClick={() => fly("right")}
                aria-label="Ça m'intéresse"
                className="bg-signature glow-pink flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
              >
                <Heart className="h-8 w-8" fill="currentColor" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------- Annonce ouverte en grand (photos + détails) ---------- */}
      {detail && (
        <ListingDetail
          listing={detail}
          onClose={() => setDetail(null)}
          onLike={() => {
            setDetail(null);
            fly("right");
          }}
          onPass={() => {
            setDetail(null);
            fly("left");
          }}
        />
      )}

      {/* ---------- Écran FlatSwiper+ (limite de likes atteinte) ---------- */}
      {paywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-7 text-center">
            <p className="font-display text-3xl font-bold leading-tight">
              Plus de likes gratuits aujourd&apos;hui
            </p>
            <p className="mt-3 text-ink/80">
              Tu as utilisé tes {LIKES_GRATUITS_PAR_JOUR} likes du jour. Reviens
              demain… ou passe en{" "}
              <span className="text-signature font-semibold">FlatSwiper+</span> :
            </p>
            {lancement && (
              <div className="bg-signature mt-4 rounded-xl px-3 py-2 text-sm font-semibold text-white">
                🎁 Offre de lancement : c&apos;est GRATUIT en ce moment&nbsp;!
              </div>
            )}
            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-ink/85">
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-bleu" fill="currentColor" /> Likes
                illimités
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-bleu" /> Vois qui t&apos;a déjà liké
              </li>
              <li className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-bleu" /> Ton profil mis en avant
                (Boost)
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/boutique")}
                className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
              >
                {lancement ? "J'en profite — c'est gratuit" : "Voir les offres FlatSwiper+"}
              </button>
              {/* Gratuit : inviter des amis pour gagner des swipes */}
              {user && (
                <InviterAmis
                  onBonus={() => {
                    const b = getBonusLikes(user.id);
                    setBonusLikes(b);
                    if (likesAujourdhui < LIKES_GRATUITS_PAR_JOUR + b)
                      setPaywall(false);
                  }}
                />
              )}
              <button
                onClick={() => setPaywall(false)}
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

      {/* ---------- Modale de match ---------- */}
      {match && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-8 text-center">
            <p className="font-display text-signature text-4xl font-bold">
              C&apos;est un match !
            </p>
            <p className="mt-3 text-ink/80">
              Toi et la coloc de{" "}
              <span className="font-semibold">{lieuComplet(match)}</span> vous
              plaisez. Lance la conversation pour organiser une visite.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/matchs")}
                className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
              >
                Envoyer un message
              </button>
              <button
                onClick={() => setMatch(null)}
                className="rounded-full px-6 py-3 font-medium text-ink/70 hover:text-ink"
              >
                Continuer à swiper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
