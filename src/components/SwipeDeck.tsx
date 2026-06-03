"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import type { Listing } from "@/data/listings";
import { getListings } from "@/lib/listings";
import { loadProfile } from "@/lib/profile";
import ListingCard from "./ListingCard";

type Direction = "left" | "right";

// Bornes de budget pour le curseur
const BUDGET_MIN = 500;
const BUDGET_MAX = 900;

export default function SwipeDeck() {
  const [index, setIndex] = useState(0); // carte du dessus
  const [match, setMatch] = useState<Listing | null>(null);
  const [likes, setLikes] = useState<Listing[]>([]); // annonces aimées

  // Annonces chargées depuis le serveur Supabase
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // --- Filtres ---
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX);
  const [quartier, setQuartier] = useState("all");
  const [dispoAvant, setDispoAvant] = useState(""); // "" = pas de filtre date
  const [prenom, setPrenom] = useState("");

  // Au chargement : on récupère les annonces depuis Supabase
  useEffect(() => {
    getListings()
      .then((data) => setAllListings(data))
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, []);

  // Au chargement : on pré-remplit les filtres depuis le profil enregistré
  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    setPrenom(p.prenom);
    if (p.budgetMax) {
      // on garde la valeur dans les bornes du curseur
      const v = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, p.budgetMax));
      setBudgetMax(v);
    }
    if (p.dateEmmenagement) setDispoAvant(p.dateEmmenagement);
  }, []);

  // Liste des quartiers présents dans les annonces (pour le menu déroulant)
  const quartiers = useMemo(
    () => Array.from(new Set(allListings.map((l) => l.quartier))).sort(),
    [allListings]
  );

  // Annonces qui passent les filtres
  const filtered = useMemo(() => {
    return allListings.filter((l) => {
      if (l.loyer > budgetMax) return false;
      if (quartier !== "all" && l.quartier !== quartier) return false;
      if (dispoAvant && l.dispo > dispoAvant) return false;
      return true;
    });
  }, [allListings, budgetMax, quartier, dispoAvant]);

  // Position horizontale de la carte du dessus (pour le glissement)
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -40], [1, 0]);
  const controls = useAnimationControls();
  const animating = useRef(false);

  const current = filtered[index];
  const next = filtered[index + 1];

  // Quand on change un filtre : on revient à la première carte
  function resetDeck() {
    setIndex(0);
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
  }

  // Fait voler la carte hors de l'écran puis passe à la suivante
  async function fly(dir: Direction) {
    if (animating.current || !current) return;
    animating.current = true;

    await controls.start({
      x: dir === "right" ? 700 : -700,
      opacity: 0,
      transition: { duration: 0.35 },
    });

    if (dir === "right") {
      setLikes((prev) => [...prev, current]);
      if (Math.random() < 0.5) setMatch(current);
    }

    setIndex((i) => i + 1);
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    animating.current = false;
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
        <p className="mb-3 w-full text-left font-display text-xl">
          Salut {prenom} 👋
        </p>
      )}

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
        <div className="flex h-[480px] flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-2xl">Aucune annonce</p>
          <p className="max-w-xs text-sm text-ink/70">
            Aucune colocation ne correspond à ces filtres. Essaie d&apos;augmenter
            ton budget ou de changer de quartier.
          </p>
        </div>
      ) : !current ? (
        <div className="flex h-[480px] flex-col items-center justify-center gap-5 text-center">
          <p className="font-display text-3xl">C&apos;est tout pour l&apos;instant !</p>
          <p className="max-w-xs text-ink/70">
            Tu as parcouru toutes les colocations correspondant à tes filtres.
          </p>
          <p className="text-sm text-pink-light">
            {likes.length} annonce{likes.length > 1 ? "s" : ""} aimée
            {likes.length > 1 ? "s" : ""} 💗
          </p>
          <button
            onClick={() => {
              setLikes([]);
              resetDeck();
            }}
            className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
          >
            Tout revoir
          </button>
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
              className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/15 bg-panel text-2xl transition-transform hover:scale-110"
            >
              👋
            </button>
            <button
              onClick={() => fly("right")}
              aria-label="Ça m'intéresse"
              className="bg-signature glow-pink flex h-20 w-20 items-center justify-center rounded-full text-3xl transition-transform hover:scale-110"
            >
              💗
            </button>
          </div>
        </>
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
                disabled
                className="bg-signature cursor-not-allowed rounded-full px-6 py-3 font-semibold text-white opacity-60"
              >
                Envoyer un message (bientôt)
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
