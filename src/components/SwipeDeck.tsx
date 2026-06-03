"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import { listings, type Listing } from "@/data/listings";
import ListingCard from "./ListingCard";

type Direction = "left" | "right";

export default function SwipeDeck() {
  const [index, setIndex] = useState(0); // carte du dessus
  const [match, setMatch] = useState<Listing | null>(null);
  const [likes, setLikes] = useState<Listing[]>([]); // annonces aimées

  // Position horizontale de la carte du dessus (pour le glissement)
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 130], [0, 1]); // étiquette "ÇA M'INTÉRESSE"
  const nopeOpacity = useTransform(x, [-130, -40], [1, 0]); // étiquette "JE PASSE"
  const controls = useAnimationControls();
  const animating = useRef(false);

  const current = listings[index];
  const next = listings[index + 1];

  // Fait voler la carte hors de l'écran puis passe à la suivante
  async function fly(dir: Direction) {
    if (animating.current || !current) return;
    animating.current = true;

    await controls.start({
      x: dir === "right" ? 700 : -700,
      opacity: 0,
      transition: { duration: 0.35 },
    });

    // Match : sur un "ça m'intéresse", 50% de chance de match (simulé)
    if (dir === "right") {
      setLikes((prev) => [...prev, current]);
      if (Math.random() < 0.5) setMatch(current);
    }

    setIndex((i) => i + 1);
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    animating.current = false;
  }

  // Quand on lâche la carte après l'avoir glissée
  function handleDragEnd(
    _e: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) {
    if (info.offset.x > 120 || info.velocity.x > 600) fly("right");
    else if (info.offset.x < -120 || info.velocity.x < -600) fly("left");
    else controls.start({ x: 0, transition: { type: "spring", stiffness: 300 } });
  }

  // Plus aucune annonce à montrer
  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        <p className="font-display text-3xl">C&apos;est tout pour l&apos;instant !</p>
        <p className="max-w-xs text-ink/70">
          Tu as parcouru toutes les colocations disponibles. Reviens bientôt, de
          nouvelles annonces arrivent.
        </p>
        <p className="text-sm text-pink-light">
          {likes.length} annonce{likes.length > 1 ? "s" : ""} aimée
          {likes.length > 1 ? "s" : ""} 💗
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setLikes([]);
          }}
          className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
        >
          Tout revoir
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* Pile de cartes */}
      <div className="relative h-[560px] w-full max-w-sm">
        {/* Carte suivante en fond (effet de pile) */}
        {next && (
          <div className="absolute inset-0 scale-95 opacity-60">
            <ListingCard listing={next} />
          </div>
        )}

        {/* Carte du dessus, glissable */}
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
          {/* Étiquette "ÇA M'INTÉRESSE" (apparaît en glissant à droite) */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="bg-signature absolute top-10 left-6 z-10 -rotate-12 rounded-xl px-4 py-2 text-lg font-extrabold text-white"
          >
            ÇA M&apos;INTÉRESSE
          </motion.div>
          {/* Étiquette "JE PASSE" (apparaît en glissant à gauche) */}
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

      {/* Modale de match */}
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
