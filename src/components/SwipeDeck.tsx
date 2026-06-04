"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Sparkles, Star, Eye, Rocket } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import type { Listing } from "@/data/listings";
import { getListings } from "@/lib/listings";
import { useAuth } from "@/lib/auth";
import { estPremium } from "@/lib/offers";
import {
  getSwipedListingIds,
  recordListingSwipe,
  findMatchForListing,
  getLikesToday,
} from "@/lib/swipes";
import ListingCard from "./ListingCard";

type Direction = "left" | "right";

// Bornes de budget pour le curseur
const BUDGET_MIN = 500;
const BUDGET_MAX = 900;

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
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // Likes gratuits du jour
  const [likesAujourdhui, setLikesAujourdhui] = useState(0);
  const [paywall, setPaywall] = useState(false); // écran "limite atteinte"

  // Pass Express actif ? (likes illimités), lu depuis le compte
  const premium = estPremium(profile);

  // --- Filtres ---
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX);
  const [quartier, setQuartier] = useState("all");
  const [dispoAvant, setDispoAvant] = useState(""); // "" = pas de filtre date
  const [prenom, setPrenom] = useState("");

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
    ])
      .then(([data, swiped, likes]) => {
        setAllListings(data);
        setSwipedIds(swiped);
        setLikesAujourdhui(likes);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [user]);

  // On pré-remplit les filtres depuis le profil du compte connecté
  useEffect(() => {
    if (!profile) return;
    setPrenom(profile.prenom);
    if (profile.budget_max) {
      const v = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, profile.budget_max));
      setBudgetMax(v);
    }
    if (profile.date_emmenagement) setDispoAvant(profile.date_emmenagement);
  }, [profile]);

  // Liste des quartiers présents dans les annonces (pour le menu déroulant)
  const quartiers = useMemo(
    () => Array.from(new Set(allListings.map((l) => l.quartier))).sort(),
    [allListings]
  );

  // Annonces qui passent les filtres (et pas encore swipées)
  const filtered = useMemo(() => {
    return allListings.filter((l) => {
      if (swipedIds.has(l.id)) return false;
      if (l.loyer > budgetMax) return false;
      if (quartier !== "all" && l.quartier !== quartier) return false;
      if (dispoAvant && l.dispo > dispoAvant) return false;
      return true;
    });
  }, [allListings, swipedIds, budgetMax, quartier, dispoAvant]);

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

  // A-t-on encore des likes gratuits aujourd'hui ?
  const likesEpuises = !premium && likesAujourdhui >= LIKES_GRATUITS_PAR_JOUR;

  // Fait voler la carte hors de l'écran puis passe à la suivante
  async function fly(dir: Direction) {
    if (animating.current || !current || !user) return;

    // Limite de likes gratuits : on bloque le "j'aime" et on propose Colock't+
    if (dir === "right" && likesEpuises) {
      setPaywall(true);
      return;
    }

    animating.current = true;
    const swiped = current; // on retient l'annonce avant d'avancer la pile

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
    try {
      await recordListingSwipe(user.id, swiped.id, direction);
      if (direction === "like") {
        setLikes((prev) => [...prev, swiped]);
        setLikesAujourdhui((n) => n + 1);
        // match seulement si le locataire t'a aussi liké
        if (await findMatchForListing(user.id, swiped.id)) setMatch(swiped);
      }
    } catch {
      // souci réseau : on n'interrompt pas le swipe
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
    <div className="flex w-full max-w-sm flex-col items-center">
      {/* Message d'accueil personnalisé */}
      {prenom && (
        <p className="mb-1 flex w-full items-center gap-2 text-left font-display text-xl">
          Salut {prenom}
          <Sparkles className="h-5 w-5 text-pink" />
        </p>
      )}

      {/* Likes gratuits restants aujourd'hui */}
      <p className="mb-3 w-full text-left text-xs text-ink/50">
        {premium ? (
          <span className="inline-flex items-center gap-1 font-medium text-pink">
            <Star className="h-3.5 w-3.5" fill="currentColor" /> Colock&apos;t+ · likes
            illimités
          </span>
        ) : (
          (() => {
            const r = Math.max(0, LIKES_GRATUITS_PAR_JOUR - likesAujourdhui);
            return `${r} like${r > 1 ? "s" : ""} gratuit${r > 1 ? "s" : ""} aujourd'hui`;
          })()
        )}
      </p>

      {/* ---------- Barre de filtres ---------- */}
      <div className="mb-5 w-full rounded-2xl bg-panel p-4">
        {/* Budget max */}
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="budget" className="text-ink/70">
            Budget max
          </label>
          <span className="font-semibold text-pink-light">{budgetMax} € / mois</span>
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

        {/* Quartier + date */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
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

        {/* Nombre de résultats + réinitialiser */}
        <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
          <span>
            {filtered.length} annonce{filtered.length > 1 ? "s" : ""} trouvée
            {filtered.length > 1 ? "s" : ""}
          </span>
          {(budgetMax !== BUDGET_MAX || quartier !== "all" || dispoAvant) && (
            <button
              onClick={() => {
                setBudgetMax(BUDGET_MAX);
                setQuartier("all");
                setDispoAvant("");
                resetDeck();
              }}
              className="text-pink-light hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ---------- Zone des cartes ---------- */}
      {filtered.length === 0 ? (
        <div className="flex h-[480px] flex-col items-center justify-center gap-4 text-center">
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
          {/* Pile de cartes */}
          <div className="relative h-[560px] w-full">
            {next && (
              <div className="absolute inset-0 scale-95 opacity-60">
                <ListingCard listing={next} />
              </div>
            )}

            <motion.div
              key={current.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
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

              <ListingCard listing={current} />
            </motion.div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-6 flex items-center gap-8">
            <button
              onClick={() => fly("left")}
              aria-label="Je passe"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/15 bg-panel text-ink/60 transition-transform hover:scale-110"
            >
              <X className="h-7 w-7" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => fly("right")}
              aria-label="Ça m'intéresse"
              className="bg-signature glow-pink flex h-20 w-20 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            >
              <Heart className="h-9 w-9" fill="currentColor" />
            </button>
          </div>
        </>
      )}

      {/* ---------- Écran Colock't+ (limite de likes atteinte) ---------- */}
      {paywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-7 text-center">
            <p className="font-display text-3xl font-bold leading-tight">
              Plus de likes gratuits aujourd&apos;hui
            </p>
            <p className="mt-3 text-ink/80">
              Tu as utilisé tes {LIKES_GRATUITS_PAR_JOUR} likes du jour. Reviens
              demain… ou passe en{" "}
              <span className="text-signature font-semibold">Colock&apos;t+</span> :
            </p>
            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-ink/85">
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink" fill="currentColor" /> Likes
                illimités
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink" /> Vois qui t&apos;a déjà liké
              </li>
              <li className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-pink" /> Ton profil mis en avant
                (Boost)
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/boutique")}
                className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
              >
                Voir les offres Colock&apos;t+
              </button>
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
              <span className="font-semibold">{match.quartier}</span> (Paris{" "}
              {match.arrondissement}
              <sup>e</sup>) vous plaisez. Lance la conversation pour organiser une
              visite.
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
