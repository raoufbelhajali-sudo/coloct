"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Rocket, Send } from "lucide-react";
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
  getMatchIdForColocataire,
} from "@/lib/locataire";
import { compatProfils, scoreProfilPourAnnonceur } from "@/lib/compat";
import { getSwipes24h } from "@/lib/swipes";
import { estPremium, estHero, contacterColocataireDirect } from "@/lib/offers";
import { vibrer, vibrerSucces, ImpactStyle } from "@/lib/haptics";
import { getIdsBloques } from "@/lib/blocks";
import { marquerAnnonce } from "@/lib/matchPopup";
import ProfileCard from "./ProfileCard";
import ProfileDetail from "./ProfileDetail";

type Direction = "left" | "right";

// Limite gratuite : 20 swipes / 24h (au-delà : HeroSwiper, ou attendre 24h)
const SWIPES_PAR_JOUR = 20;

// Le locataire swipe sur les profils de colocataires intéressés
export default function ProfileSwipeDeck({
  listingId,
  typeOffre = "colocation",
}: {
  listingId: string;
  typeOffre?: string;
}) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [bloques, setBloques] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const [detail, setDetail] = useState<Profile | null>(null); // profil ouvert en grand
  const [swipesAujourdhui, setSwipesAujourdhui] = useState(0);
  const [paywall, setPaywall] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -40], [1, 0]);
  const controls = useAnimationControls();
  const animating = useRef(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getSwipedProfileIds(user.id, listingId).then((swiped) =>
        getColocataireProfiles(user.id, swiped, typeOffre)
      ),
      getIdsBloques(user.id),
      getSwipes24h(user.id),
    ])
      .then(([data, blocs, nbSwipes]) => {
        setProfiles(data);
        setBloques(blocs);
        setSwipesAujourdhui(nbSwipes);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [user, listingId, typeOffre]);

  const remaining = useMemo(() => {
    const base = profiles.filter(
      (p) => !swipedIds.has(p.id) && !bloques.has(p.id)
    );
    // Annonceur boosté (premium) → meilleurs profils en tête (poste + compatibilité)
    if (estPremium(profile)) {
      return [...base].sort(
        (a, b) =>
          scoreProfilPourAnnonceur(profile, b) -
          scoreProfilPourAnnonceur(profile, a)
      );
    }
    return base;
  }, [profiles, swipedIds, bloques, profile]);
  const current = remaining[0];
  const next = remaining[1];

  // Limite gratuite : 20 swipes / 24h. HeroSwiper = illimité.
  const swipesEpuises = !estHero(profile) && swipesAujourdhui >= SWIPES_PAR_JOUR;

  // Message direct à un colocataire SANS attendre un match — réservé au forfait
  const [contactEnCours, setContactEnCours] = useState(false);
  async function messageDirectColocataire() {
    if (!user || !current || contactEnCours) return;
    if (!estPremium(profile)) {
      router.push("/boutique"); // débloque le message direct
      return;
    }
    setContactEnCours(true);
    try {
      const mid = await contacterColocataireDirect(current.id, listingId);
      if (mid) router.push(`/matchs/conversation/?id=${mid}`);
    } finally {
      setContactEnCours(false);
    }
  }

  async function fly(dir: Direction) {
    if (animating.current || !current || !user) return;
    // Limite des 20 swipes/24h : on bloque et on propose HeroSwiper
    if (swipesEpuises) {
      setPaywall(true);
      return;
    }
    animating.current = true;
    const swiped = current;

    // Vibration tactile immédiate (plus marquée pour un like)
    vibrer(dir === "right" ? ImpactStyle.Medium : ImpactStyle.Light);

    await controls.start({
      x: dir === "right" ? 700 : -700,
      opacity: 0,
      transition: { duration: 0.35 },
    });

    setSwipedIds((prev) => new Set(prev).add(swiped.id));
    setSwipesAujourdhui((n) => n + 1); // compte tous les swipes (limite 24h)
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    animating.current = false;

    const direction = dir === "right" ? "like" : "pass";
    try {
      await recordProfileSwipe(user.id, listingId, swiped.id, direction);
      if (direction === "like") {
        const mid = await getMatchIdForColocataire(swiped.id, listingId);
        if (mid) {
          vibrerSucces(); // c'est un match !
          setMatch(swiped);
          if (user) marquerAnnonce(user.id, mid); // évite la double pop-up globale
        }
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
            Tu as vu tous les co/locataires disponibles. Reviens bientôt, de
            nouveaux profils arriveront !
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full flex-1 min-h-0">
            {next && (
              <div className="absolute inset-0 scale-95 opacity-60">
                <ProfileCard profile={next} compat={compatProfils(profile, next)} />
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

              <ProfileCard profile={current} compat={compatProfils(profile, current)} />
            </motion.div>

            {/* Boutons (couleurs codées en dégradé, tous la même taille) */}
            <div className="absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-4">
              <button
                onClick={() => fly("left")}
                aria-label="Je passe"
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
                style={{ backgroundImage: "linear-gradient(135deg,#f87171,#dc2626)" }}
              >
                <X className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => fly("right")}
                aria-label="Ça m'intéresse"
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
                style={{ backgroundImage: "linear-gradient(135deg,#34d399,#059669)" }}
              >
                <Check className="h-7 w-7" strokeWidth={3} />
              </button>
              <button
                onClick={messageDirectColocataire}
                disabled={contactEnCours}
                aria-label="Message direct au co/locataire"
                title="Écrire en direct à ce co/locataire (forfait)"
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-60"
                style={{ backgroundImage: "linear-gradient(135deg,#3b82f6,#2563eb)" }}
              >
                <Send className="h-6 w-6" />
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

      {/* Limite de 20 swipes / 24h atteinte */}
      {paywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-7 text-center">
            <p className="font-display text-3xl font-bold leading-tight">
              Tes 20 swipes sont utilisés
            </p>
            <p className="mt-3 text-ink/80">
              Reviens dans 24h pour 20 nouveaux swipes gratuits… ou passe en{" "}
              <span className="text-signature font-semibold">HeroSwiper</span>{" "}
              pour swiper sans limite.
            </p>
            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-ink/85">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-bleu" strokeWidth={3} /> Swipes illimités
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-bleu" /> Messagerie + qui t&apos;a liké
              </li>
              <li className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-bleu" /> Toutes les actions débloquées
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/boutique")}
                className="bg-signature rounded-full px-6 py-3 font-semibold text-white"
              >
                Passer HeroSwiper
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
