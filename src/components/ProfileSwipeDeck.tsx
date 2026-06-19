"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Rocket, Send, Hand, ChevronUp, BellRing } from "lucide-react";
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
import { vibrer, vibrerSucces, sonLike, ImpactStyle } from "@/lib/haptics";
import { getIdsBloques } from "@/lib/blocks";
import { marquerAnnonce } from "@/lib/matchPopup";
import ProfileCard from "./ProfileCard";
import ProfileDetail from "./ProfileDetail";

// Limite gratuite : 20 swipes / 24h (au-delà : HeroSwiper, ou attendre 24h)
const SWIPES_PAR_JOUR = 20;

// On ne monte que les profils proches de celui affiché (perf images)
const FENETRE = 2;

// Le locataire (annonceur) swipe sur les profils de colocataires intéressés —
// même présentation TikTok que le swipe chercheur (feed vertical + icônes).
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
  const [bloques, setBloques] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const [detail, setDetail] = useState<Profile | null>(null); // profil ouvert en grand
  const [swipesAujourdhui, setSwipesAujourdhui] = useState(0);
  const [paywall, setPaywall] = useState(false);
  // Décisions prises pendant la session (j'aime / passe) — le profil reste dans
  // le feed, marqué, on peut revenir en arrière.
  const [decisions, setDecisions] = useState<Record<string, "like" | "pass">>({});

  // --- Feed vertical (style TikTok) ---
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const [sortie, setSortie] = useState<{ id: string; dir: "up" | "down" } | null>(
    null
  );
  const [tactile, setTactile] = useState(false);
  useEffect(() => {
    setTactile(
      typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  // Indice « Touche pour voir » (une seule fois)
  const [hintTap, setHintTap] = useState(false);
  function fermerHintTap() {
    setHintTap(false);
    try {
      localStorage.setItem("fs-hint-tap", "1");
    } catch {
      /* indisponible */
    }
  }
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem("fs-hint-tap") === "1") return;
    } catch {
      return;
    }
    const t = setTimeout(() => setHintTap(true), 700);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!hintTap) return;
    const t = setTimeout(() => fermerHintTap(), 5000);
    return () => clearTimeout(t);
  }, [hintTap]);

  // Petit pop-up « Locataire/Colocataire notifié » sur les 3 premiers likes.
  const [notifLike, setNotifLike] = useState<string | null>(null);
  function notifierSi3PremiersLikes(message: string) {
    try {
      const n = parseInt(localStorage.getItem("fs-likenotif-annonceur") || "0", 10);
      if (n >= 3) return;
      localStorage.setItem("fs-likenotif-annonceur", String(n + 1));
    } catch {
      return;
    }
    setNotifLike(message);
  }
  useEffect(() => {
    if (!notifLike) return;
    const t = setTimeout(() => setNotifLike(null), 2600);
    return () => clearTimeout(t);
  }, [notifLike]);

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

  // Feed stable : on garde les profils décidés (marqués) pour ne pas faire
  // sauter le défilement. getColocataireProfiles exclut déjà ceux swipés avant.
  const feed = useMemo(() => {
    const base = profiles.filter((p) => !bloques.has(p.id));
    if (estPremium(profile)) {
      return [...base].sort(
        (a, b) =>
          scoreProfilPourAnnonceur(profile, b) -
          scoreProfilPourAnnonceur(profile, a)
      );
    }
    return base;
  }, [profiles, bloques, profile]);

  const active = feed[activeIndex];

  // Limite gratuite : 20 swipes / 24h. HeroSwiper = illimité.
  const swipesEpuises = !estHero(profile) && swipesAujourdhui >= SWIPES_PAR_JOUR;

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (hintTap) fermerHintTap();
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActiveIndex(i);
    }
  }

  function allerVers(i: number, instant = false) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: instant ? "auto" : "smooth" });
  }

  // J'aime / Je passe sur un profil, puis on enchaîne sur le suivant.
  async function decider(p: Profile | undefined, dir: "like" | "pass") {
    if (!user || !p) return;
    if (decisions[p.id]) return;
    if (swipesEpuises) {
      setPaywall(true);
      return;
    }
    vibrer(dir === "like" ? ImpactStyle.Medium : ImpactStyle.Light);
    if (dir === "like") {
      sonLike();
      // Locataire (cherche une location) ou colocataire (cherche une colocation)
      const cherche =
        (p.recherche_offre ?? "colocation") === "location"
          ? "Locataire"
          : "Colocataire";
      notifierSi3PremiersLikes(`${cherche} notifié`);
    }

    setDecisions((d) => ({ ...d, [p.id]: dir }));
    setSwipesAujourdhui((n) => n + 1);

    const idx = feed.findIndex((x) => x.id === p.id);
    setSortie({ id: p.id, dir: dir === "like" ? "up" : "down" });
    window.setTimeout(() => {
      if (idx >= 0) allerVers(idx + 1, true);
      setSortie(null);
    }, 280);

    try {
      await recordProfileSwipe(user.id, listingId, p.id, dir);
      if (dir === "like") {
        const mid = await getMatchIdForColocataire(p.id, listingId);
        if (mid) {
          vibrerSucces();
          setMatch(p);
          marquerAnnonce(user.id, mid); // évite la double pop-up globale
        }
      }
    } catch {
      // souci réseau : on n'interrompt pas la décision
    }
  }

  // Message direct à un colocataire SANS attendre un match — réservé au forfait
  const [contactEnCours, setContactEnCours] = useState(false);
  async function messageDirectColocataire(p: Profile | undefined) {
    if (!user || !p || contactEnCours) return;
    if (!estPremium(profile)) {
      router.push("/boutique"); // débloque le message direct
      return;
    }
    setContactEnCours(true);
    try {
      const mid = await contacterColocataireDirect(p.id, listingId);
      if (mid) router.push(`/matchs/conversation/?id=${mid}`);
    } finally {
      setContactEnCours(false);
    }
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
    <div className="flex h-full w-full max-w-none flex-col sm:max-w-sm lg:max-w-[38rem] lg:overflow-hidden lg:rounded-3xl lg:shadow-2xl">
      {feed.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="font-display text-2xl">Aucun profil pour l&apos;instant</p>
          <p className="max-w-xs text-sm text-ink/70">
            Tu as vu tous les co/locataires disponibles. Reviens bientôt, de
            nouveaux profils arriveront !
          </p>
        </div>
      ) : (
        <div className="relative w-full flex-1 min-h-0">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {feed.map((p, i) => {
              const dec = decisions[p.id];
              const proche = Math.abs(i - activeIndex) <= FENETRE;
              return (
                <div key={p.id} className="relative h-full w-full snap-start snap-always">
                  {proche && (
                    <>
                      <div
                        className={
                          "h-full w-full transition-[transform,opacity] duration-300 " +
                          (sortie?.id === p.id
                            ? sortie.dir === "up"
                              ? "-translate-y-full opacity-0"
                              : "translate-y-full opacity-0"
                            : "")
                        }
                        onClick={() => {
                          fermerHintTap();
                          setDetail(p);
                        }}
                      >
                        <ProfileCard profile={p} compat={compatProfils(profile, p)} />
                      </div>

                      {dec && (
                        <div
                          className="pointer-events-none absolute left-5 top-20 z-20 -rotate-6 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white shadow-lg"
                          style={{
                            backgroundImage:
                              dec === "like"
                                ? "linear-gradient(135deg,#34d399,#059669)"
                                : "linear-gradient(135deg,#9ca3af,#4b5563)",
                          }}
                        >
                          {dec === "like" ? "✓ Aimé" : "✕ Passé"}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Colonne d'icônes à droite (style TikTok) */}
          {active && (
            <div className="absolute bottom-10 right-3 z-30 flex flex-col items-center gap-2.5">
              <ColBtn
                label="Message"
                title="Écrire en direct à ce co/locataire (forfait)"
                disabled={contactEnCours}
                onClick={() => messageDirectColocataire(active)}
              >
                <Send className="h-[18px] w-[18px]" />
              </ColBtn>
              <ColBtn
                label="Passer"
                symbolClass="text-[#fa5252]"
                onClick={() => decider(active, "pass")}
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </ColBtn>
              <ColBtn
                label="J'aime"
                symbolClass="text-[#14b8a6]"
                big
                onClick={() => decider(active, "like")}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </ColBtn>
            </div>
          )}

          {/* Indice : glisser vers le haut (1re carte, tactile) */}
          {feed.length > 1 && activeIndex === 0 && tactile && (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-0.5 text-ink/60">
              <ChevronUp className="h-5 w-5 animate-bounce" />
              <span className="text-xs font-medium">Glisse vers le haut</span>
            </div>
          )}

          {/* Indice 1er passage : main animée « Touche pour voir » */}
          {hintTap && active && (
            <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-3">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute h-16 w-16 animate-ping rounded-full bg-white/40" />
                <span className="animate-tap-hand relative flex h-16 w-16 items-center justify-center rounded-full bg-ink/85 text-white shadow-xl">
                  <Hand className="h-8 w-8" />
                </span>
              </div>
              <span className="rounded-full bg-ink/85 px-4 py-2 text-sm font-bold text-white shadow-lg">
                Touche pour voir
              </span>
            </div>
          )}

          {/* Pop-up « Locataire/Colocataire notifié » (3 premiers likes), au centre */}
          {notifLike && (
            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4">
              <div className="flex items-center gap-2 rounded-full bg-ink/90 px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur">
                <BellRing className="h-5 w-5 text-[#14b8a6]" />
                {notifLike}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profil ouvert en grand (lecture complète) */}
      {detail && (
        <ProfileDetail
          profile={detail}
          onClose={() => setDetail(null)}
          onLike={() => {
            const p = detail;
            setDetail(null);
            decider(p, "like");
          }}
          onPass={() => {
            const p = detail;
            setDetail(null);
            decider(p, "pass");
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
                className="bg-metal rounded-full px-6 py-3 font-semibold text-white"
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
                className="bg-metal rounded-full px-6 py-3 font-semibold text-white"
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

// Bouton de la colonne d'actions : pastille noire, symbole blanc par défaut
// (turquoise pour J'aime, corail pour Passer). `big` = plus grand (J'aime).
function ColBtn({
  onClick,
  label,
  title,
  disabled,
  symbolClass = "text-white",
  big,
  children,
}: {
  onClick: () => void;
  label: string;
  title?: string;
  disabled?: boolean;
  symbolClass?: string;
  big?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className={
        "relative flex items-center justify-center rounded-full bg-ink shadow-lg ring-1 ring-white/15 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 " +
        (big ? "h-14 w-14 " : "h-10 w-10 ") +
        symbolClass
      }
    >
      {children}
    </button>
  );
}
