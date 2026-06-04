"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import { useAuth } from "@/lib/auth";
import type { Profile } from "@/lib/auth";
import {
  getColocataireProfiles,
  getSwipedProfileIds,
  recordProfileSwipe,
  findMatchForColocataire,
} from "@/lib/locataire";
import ProfileCard from "./ProfileCard";
import ProfileDetail from "./ProfileDetail";

type Direction = "left" | "right";

// Le locataire swipe sur les profils de colocataires intéressés
export default function ProfileSwipeDeck({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const [detail, setDetail] = useState<Profile | null>(null); // profil ouvert en grand

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -40], [1, 0]);
  const controls = useAnimationControls();
  const animating = useRef(false);

  useEffect(() => {
    if (!user) return;
    getSwipedProfileIds(user.id, listingId)
      .then((swiped) => getColocataireProfiles(user.id, swiped))
      .then((data) => setProfiles(data))
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [user, listingId]);

  const remaining = useMemo(
    () => profiles.filter((p) => !swipedIds.has(p.id)),
    [profiles, swipedIds]
  );
  const current = remaining[0];
  const next = remaining[1];

  async function fly(dir: Direction) {
    if (animating.current || !current || !user) return;
    animating.current = true;
    const swiped = current;

    await controls.start({
      x: dir === "right" ? 700 : -700,
      opacity: 0,
      transition: { duration: 0.35 },
    });

    setSwipedIds((prev) => new Set(prev).add(swiped.id));
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    animating.current = false;

    const direction = dir === "right" ? "like" : "pass";
    try {
      await recordProfileSwipe(user.id, listingId, swiped.id, direction);
      if (direction === "like") {
        if (await findMatchForColocataire(swiped.id, listingId)) setMatch(swiped);
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

  if (chargement) {
    return (
      <div className="flex h-[480px] items-center justify-center text-ink/60">
        Chargement des profils…
      </div>
    );
  }
  if (erreur) {
    return (
      <div className="flex h-[480px] items-center justify-center text-ink/70">
        Impossible de charger les profils. Réessaie.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-sm flex-col">
      {remaining.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-2xl">Aucun profil pour l&apos;instant</p>
          <p className="max-w-xs text-sm text-ink/70">
            Tu as vu tous les colocataires disponibles. Reviens bientôt, de
            nouveaux profils arriveront !
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full flex-1 min-h-0">
            {next && (
              <div className="absolute inset-0 scale-95 opacity-60">
                <ProfileCard profile={next} />
              </div>
            )}

            <motion.div
              key={current.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              onTap={() => setDetail(current)}
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

              <ProfileCard profile={current} />
            </motion.div>

            {/* Boutons posés sur la carte */}
            <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-6">
              <button
                onClick={() => fly("left")}
                aria-label="Je passe"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-bg/90 text-ink/60 shadow-lg backdrop-blur transition-transform hover:scale-110"
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
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

      {/* Profil ouvert en grand (lecture complète) */}
      {detail && (
        <ProfileDetail
          profile={detail}
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

      {/* Modale de match */}
      {match && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-8 text-center">
            <p className="font-display text-signature text-4xl font-bold">
              C&apos;est un match !
            </p>
            <p className="mt-3 text-ink/80">
              Toi et <span className="font-semibold">{match.prenom}</span> vous
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
