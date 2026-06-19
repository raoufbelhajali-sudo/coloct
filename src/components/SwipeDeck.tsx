"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Eye,
  Rocket,
  SlidersHorizontal,
  Share2,
  Bookmark,
  AlertCircle,
  Send,
  ChevronUp,
  Hand,
  BellRing,
} from "lucide-react";
import type { Listing } from "@/data/listings";
import { getListings, lieuComplet } from "@/lib/listings";
import { compatAnnonce } from "@/lib/compat";
import { getIdsBloques } from "@/lib/blocks";
import { geocodeVille, distanceKm, type Coord } from "@/lib/geo";
import { partagerAnnonce } from "@/lib/partage";
import { useAuth } from "@/lib/auth";
import { estHero, contacterDirect } from "@/lib/offers";
import { champsManquantsSwipe } from "@/lib/completude";
import { vibrer, vibrerSucces, sonLike, ImpactStyle } from "@/lib/haptics";
import {
  getSwipedListingIds,
  recordListingSwipe,
  getSwipes24h,
  getMatchIdForListing,
} from "@/lib/swipes";
import {
  getFavorisIds,
  ajouterFavori,
  retirerFavori,
} from "@/lib/favoris";
import { marquerAnnonce } from "@/lib/matchPopup";
import ListingCard from "./ListingCard";
import ListingDetail from "./ListingDetail";
import LieuSelect from "./LieuSelect";

// Bornes de budget pour le curseur
const BUDGET_MIN = 500;
const BUDGET_MAX = 900;

// Borne du filtre distance (au max = pas de limite, "toute la France")
const DIST_MAX = 200;

// Nombre de swipes gratuits par 24h (au-delà : HeroSwiper, ou attendre 24h)
const SWIPES_PAR_JOUR = 20;

// On ne monte que les annonces proches de celle affichée (perf : pas 50 images
// d'un coup). Les autres slides restent des cases vides de même hauteur pour
// garder le défilement correct.
const FENETRE = 2;

// Mémoire des filtres choisis pendant la session : survit aux navigations entre
// pages (tant qu'on ne recharge pas entièrement la page). Évite que les filtres
// — notamment après un « Réinitialiser » — soient écrasés par les valeurs du
// profil à chaque retour sur le swipe (sinon les annonces redisparaissent).
type FiltresMemo = {
  budgetMax: number;
  quartier: string;
  dispoAvant: string;
  maxDistance: number;
  offreFiltre: string;
  villeFiltre: string;
  deptFiltre: string;
};
let filtresMemo: FiltresMemo | null = null;

export default function SwipeDeck() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [match, setMatch] = useState<Listing | null>(null);
  const [likes, setLikes] = useState<Listing[]>([]); // annonces aimées
  // Annonces déjà swipées (on les retire du paquet au fur et à mesure)
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  // Annonces déjà swipées AVANT cette session : on les retire du feed.
  // (Les décisions prises pendant la session restent visibles, marquées.)
  const dejaSwipe = useRef<Set<string>>(new Set());
  // Décisions prises pendant cette session (j'aime / passe), par annonce
  const [decisions, setDecisions] = useState<Record<string, "like" | "pass">>({});

  // Annonces chargées depuis le serveur Supabase
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [bloques, setBloques] = useState<Set<string>>(new Set());
  const [favorisIds, setFavorisIds] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  // Swipes des dernières 24h (limite gratuite = SWIPES_PAR_JOUR)
  const [swipesAujourdhui, setSwipesAujourdhui] = useState(0);
  const [paywall, setPaywall] = useState(false); // écran "limite atteinte"
  const [detail, setDetail] = useState<Listing | null>(null); // annonce ouverte en grand
  const [filtresOuverts, setFiltresOuverts] = useState(false); // panneau filtres replié par défaut

  // Type recherché, fixé à l'inscription : "colocation" ou "location".
  // Par défaut le chercheur voit ce type, mais il peut basculer sur l'autre
  // depuis les filtres (offreFiltre). offreActive = type réellement affiché.
  const rechercheOffre = profile?.recherche_offre ?? "colocation";
  const [offreFiltre, setOffreFiltre] = useState(() => filtresMemo?.offreFiltre ?? "");
  const offreActive = offreFiltre || rechercheOffre;

  // --- Filtres --- (valeurs initiales reprises de la mémoire de session si dispo)
  const [budgetMax, setBudgetMax] = useState(() => filtresMemo?.budgetMax ?? BUDGET_MAX);
  const [quartier, setQuartier] = useState(() => filtresMemo?.quartier ?? "all");
  const [dispoAvant, setDispoAvant] = useState(() => filtresMemo?.dispoAvant ?? ""); // "" = pas de filtre date
  const [maxDistance, setMaxDistance] = useState(() => filtresMemo?.maxDistance ?? DIST_MAX); // DIST_MAX = pas de limite
  const [coordChercheur, setCoordChercheur] = useState<Coord | null>(null);
  // Centre du filtre distance : modifiable (par défaut, la ville du profil)
  const [villeFiltre, setVilleFiltre] = useState(() => filtresMemo?.villeFiltre ?? "");
  const [deptFiltre, setDeptFiltre] = useState(() => filtresMemo?.deptFiltre ?? "");

  // --- Feed vertical (style TikTok) ---
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0); // évite de setState à chaque pixel de scroll
  // Animation de sortie au like/pass : la carte s'envole vers le haut (like)
  // ou vers le bas (pass) avant de passer à la suivante.
  const [sortie, setSortie] = useState<{ id: string; dir: "up" | "down" } | null>(
    null
  );
  // Appareil tactile ? (sur PC/souris on cache l'indice « Glisse vers le haut »)
  const [tactile, setTactile] = useState(false);
  useEffect(() => {
    setTactile(
      typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  // Indice « Touche pour voir » : main animée au tout 1er passage sur le swipe
  // (affiché une seule fois, mémorisé dans le navigateur).
  const [hintTap, setHintTap] = useState(false);
  function fermerHintTap() {
    setHintTap(false);
    try {
      localStorage.setItem("fs-hint-tap", "1");
    } catch {
      /* stockage indisponible */
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
  // Disparaît tout seul après quelques secondes
  useEffect(() => {
    if (!hintTap) return;
    const t = setTimeout(() => fermerHintTap(), 5000);
    return () => clearTimeout(t);
  }, [hintTap]);

  // Petit pop-up « L'annonceur est notifié » sur les 3 premiers likes seulement.
  const [notifLike, setNotifLike] = useState<string | null>(null);
  function notifierSi3PremiersLikes(message: string) {
    try {
      const n = parseInt(localStorage.getItem("fs-likenotif-chercheur") || "0", 10);
      if (n >= 3) return;
      localStorage.setItem("fs-likenotif-chercheur", String(n + 1));
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
      getSwipes24h(user.id),
      getIdsBloques(user.id),
      getFavorisIds(user.id),
    ])
      .then(([data, swiped, nbSwipes, blocs, favs]) => {
        dejaSwipe.current = swiped; // figé pour la stabilité du feed
        setAllListings(data);
        setSwipedIds(swiped);
        setSwipesAujourdhui(nbSwipes);
        setBloques(blocs);
        setFavorisIds(favs);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [user]);

  // On pré-remplit les filtres depuis le profil — UNE SEULE FOIS, au premier
  // chargement. Sinon, un rechargement du profil (rafraîchissement de token
  // Supabase, refocus de l'onglet…) relancerait cet effet et réappliquerait
  // budget/date, écrasant les filtres réglés par l'utilisateur (ex: après un
  // « Réinitialiser les filtres », les annonces disparaîtraient à nouveau).
  const filtresInitialises = useRef(false);
  useEffect(() => {
    if (!profile || filtresInitialises.current) return;
    filtresInitialises.current = true;
    // Déjà des filtres en mémoire de session (ex: l'utilisateur a navigué) →
    // on les garde, on n'écrase PAS avec les valeurs du profil.
    if (filtresMemo) return;
    let bud = BUDGET_MAX;
    let dat = "";
    if (profile.budget_max) {
      bud = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, profile.budget_max));
      setBudgetMax(bud);
    }
    if (profile.date_emmenagement) {
      dat = profile.date_emmenagement;
      setDispoAvant(dat);
    }
    const ville = profile.ville ?? "";
    const dept = profile.departement ?? "";
    setVilleFiltre(ville);
    setDeptFiltre(dept);
    // On fige ces valeurs en mémoire de session (point de départ).
    filtresMemo = {
      budgetMax: bud,
      quartier: "all",
      dispoAvant: dat,
      maxDistance: DIST_MAX,
      offreFiltre: "",
      villeFiltre: ville,
      deptFiltre: dept,
    };
  }, [profile]);

  // Mémorise les filtres à chaque changement (pour survivre aux navigations).
  // On n'écrit qu'une fois la 1re initialisation faite (filtresMemo non nul).
  useEffect(() => {
    if (filtresMemo === null) return;
    filtresMemo = {
      budgetMax,
      quartier,
      dispoAvant,
      maxDistance,
      offreFiltre,
      villeFiltre,
      deptFiltre,
    };
  }, [budgetMax, quartier, dispoAvant, maxDistance, offreFiltre, villeFiltre, deptFiltre]);

  // Coordonnées du centre du filtre distance (ville du filtre, modifiable)
  useEffect(() => {
    if (!villeFiltre) {
      setCoordChercheur(null);
      return;
    }
    let actif = true;
    geocodeVille(villeFiltre, deptFiltre || undefined).then((c) => {
      if (actif) setCoordChercheur(c);
    });
    return () => {
      actif = false;
    };
  }, [villeFiltre, deptFiltre]);

  // Liste des quartiers présents dans les annonces (pour le menu déroulant)
  const quartiers = useMemo(
    () => Array.from(new Set(allListings.map((l) => l.quartier))).sort(),
    [allListings]
  );

  // Annonces qui passent les filtres. On exclut seulement celles déjà swipées
  // AVANT la session (dejaSwipe) : le feed reste stable quand on aime/passe
  // pendant la session (l'annonce reste, marquée). Recalculé uniquement quand
  // les filtres changent — pas à chaque décision.
  const feed = useMemo(() => {
    return allListings.filter((l) => {
      const offre = l.typeOffre ?? "colocation";
      // Le chercheur voit son type (choisi à l'inscription), ou les deux si
      // « tous » est sélectionné dans les filtres.
      if (offreActive !== "tous" && offre !== offreActive) return false;
      if (dejaSwipe.current.has(l.id)) return false;
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
    bloques,
    offreActive,
    budgetMax,
    quartier,
    dispoAvant,
    maxDistance,
    coordChercheur,
  ]);

  // Annonce actuellement à l'écran (celle sur laquelle agissent les icônes)
  const active = feed[activeIndex];

  // Limite gratuite : 20 swipes / 24h. HeroSwiper = illimité.
  const swipesEpuises = !estHero(profile) && swipesAujourdhui >= SWIPES_PAR_JOUR;
  // Au-delà de la limite : on masque (floute) les annonces et on propose le Hero
  const flou = swipesEpuises;

  // Suit l'annonce visible pendant le défilement (snap vertical)
  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (hintTap) fermerHintTap(); // le 1er défilement masque l'indice
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActiveIndex(i);
    }
  }

  // Fait défiler jusqu'à une annonce du feed (instant = sans animation de scroll)
  function allerVers(i: number, instant = false) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: instant ? "auto" : "smooth" });
  }

  // Quand on change un filtre : on remonte le feed en haut
  function resetDeck() {
    activeRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  // Y a-t-il au moins un filtre actif (différent du réglage par défaut) ?
  const filtresActifs =
    budgetMax !== BUDGET_MAX ||
    quartier !== "all" ||
    !!dispoAvant ||
    maxDistance < DIST_MAX ||
    (!!offreFiltre && offreFiltre !== rechercheOffre);

  // Remet les filtres à zéro et bascule sur « Les deux » (colocation + location)
  // pour montrer aussi les locations après un reset.
  function reinitialiserFiltres() {
    setBudgetMax(BUDGET_MAX);
    setQuartier("all");
    setDispoAvant("");
    setMaxDistance(DIST_MAX);
    setOffreFiltre("tous");
    resetDeck();
  }

  // Ouverture AUTO du panneau de filtres uniquement quand l'utilisateur a
  // PARCOURU toutes les annonces correspondant à ses critères (toutes décidées),
  // pas à l'arrivée / à la connexion. On exige au moins une décision faite.
  const popupVideOuvert = useRef(false);
  useEffect(() => {
    if (chargement) return;
    const restantes = feed.filter((l) => !decisions[l.id]).length;
    if (restantes > 0) {
      popupVideOuvert.current = false; // il reste des annonces → on réarme
      return;
    }
    const aDecide = Object.keys(decisions).length > 0; // a réellement swipé
    if (aDecide && filtresActifs && !popupVideOuvert.current) {
      popupVideOuvert.current = true;
      setFiltresOuverts(true);
    }
  }, [feed, decisions, chargement, filtresActifs]);

  // J'aime / Je passe sur une annonce, puis on enchaîne sur la suivante.
  // (Le simple défilement, lui, ne décide rien : on peut revenir en arrière.)
  async function decider(listing: Listing | undefined, dir: "like" | "pass") {
    if (!user || !listing) return;
    if (decisions[listing.id]) return; // déjà décidé pendant la session

    // Limite des 20 swipes/24h : on bloque et on propose HeroSwiper
    if (swipesEpuises) {
      setPaywall(true);
      return;
    }

    // Retour immédiat : vibration (mobile) + petit son sur le like (PC)
    vibrer(dir === "like" ? ImpactStyle.Medium : ImpactStyle.Light);
    if (dir === "like") {
      sonLike();
      notifierSi3PremiersLikes("L'annonceur est notifié");
    }

    setDecisions((d) => ({ ...d, [listing.id]: dir }));
    setSwipedIds((prev) => new Set(prev).add(listing.id));
    setSwipesAujourdhui((n) => n + 1);

    // La carte s'envole : vers le HAUT pour un like, vers le BAS pour un pass,
    // puis on enchaîne (instantanément) sur l'annonce suivante du feed.
    const idx = feed.findIndex((l) => l.id === listing.id);
    setSortie({ id: listing.id, dir: dir === "like" ? "up" : "down" });
    window.setTimeout(() => {
      if (idx >= 0) allerVers(idx + 1, true);
      setSortie(null);
    }, 280);

    try {
      await recordListingSwipe(user.id, listing.id, dir, false);
      if (dir === "like") {
        setLikes((prev) => [...prev, listing]);
        // match seulement si le locataire t'a aussi liké
        const mid = await getMatchIdForListing(user.id, listing.id);
        if (mid) {
          vibrerSucces(); // c'est un match !
          setMatch(listing);
          marquerAnnonce(user.id, mid); // évite la double pop-up globale
        }
      }
    } catch {
      // souci réseau : on n'interrompt pas la décision
    }
  }

  // Message direct à l'annonceur SANS attendre un match — réservé HeroSwiper
  const [contactEnCours, setContactEnCours] = useState(false);
  async function messageDirect(listing: Listing | undefined) {
    if (!user || !listing || contactEnCours) return;
    if (!estHero(profile)) {
      router.push("/boutique"); // fonctionnalité HeroSwiper
      return;
    }
    setContactEnCours(true);
    try {
      const mid = await contacterDirect(listing.id);
      if (mid) router.push(`/matchs/conversation/?id=${mid}`);
    } finally {
      setContactEnCours(false);
    }
  }

  // Ajoute / retire une annonce des favoris
  async function basculerFavori(listing: Listing | undefined) {
    if (!user || !listing) return;
    const id = listing.id;
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

  // Pendant le chargement des annonces depuis le serveur
  if (chargement) {
    return (
      <div className="flex h-[480px] items-center justify-center text-ink/60">
        Chargement des annonces…
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

  // Profil incomplet → on bloque le swipe et on liste ce qui manque (en rouge)
  const manque = profile ? champsManquantsSwipe(profile) : [];
  if (manque.length > 0) {
    return (
      <div className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-4 px-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dc2626]/10 text-[#dc2626]">
          <AlertCircle className="h-8 w-8" />
        </span>
        <p className="font-display text-2xl font-bold">
          Complète ton profil pour swiper
        </p>
        <p className="max-w-xs text-sm text-ink/70">
          Pour matcher, ton profil doit être complet. Il te manque&nbsp;:
        </p>
        <ul className="space-y-1.5 text-left text-sm font-semibold text-[#dc2626]">
          {manque.map((c) => (
            <li key={c.cle} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> {c.label}
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push("/profil")}
          className="bg-metal mt-2 rounded-full px-6 py-3 font-semibold text-white"
        >
          Compléter mon profil
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-none flex-col sm:max-w-sm lg:max-w-[38rem] lg:overflow-hidden lg:rounded-3xl lg:shadow-2xl">

      {/* ---------- Filtres (pop-up) ---------- */}
      {filtresOuverts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setFiltresOuverts(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-panel p-5"
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

            {/* Type d'offre : colocation / location (le chercheur peut basculer) */}
            <div className="mb-4">
              <label className="text-sm text-ink/70">Type</label>
              <div className="mt-1 grid grid-cols-3 gap-2 rounded-xl bg-panel-2 p-1">
                {([
                  ["colocation", "Colocation"],
                  ["location", "Location"],
                  ["tous", "Les deux"],
                ] as const).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setOffreFiltre(v);
                      resetDeck();
                    }}
                    className={
                      "rounded-lg px-2 py-2 text-sm font-semibold transition-colors " +
                      (offreActive === v
                        ? "bg-signature text-white"
                        : "text-ink/70 hover:text-ink")
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
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

            {/* Localisation (centre du filtre distance) */}
            <div className="mt-4">
              <label className="text-sm text-ink/70">Localisation</label>
              <div className="mt-1">
                <LieuSelect
                  ville={villeFiltre}
                  departement={deptFiltre}
                  onChange={(v, d) => {
                    setVilleFiltre(v);
                    setDeptFiltre(d);
                    resetDeck();
                  }}
                  className="w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-2 text-ink"
                />
              </div>
            </div>

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
                Choisis une localisation ci-dessus pour activer le filtre par
                distance.
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
              className="bg-metal glow-pink mt-5 w-full rounded-full px-6 py-3 font-semibold text-white"
            >
              Voir les {feed.length} annonce{feed.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Zone des cartes (feed vertical TikTok) ---------- */}
      {feed.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-display text-3xl">C&apos;est tout pour l&apos;instant !</p>
          <p className="max-w-xs text-sm text-ink/70">
            {filtresActifs
              ? "Aucune annonce ne correspond à tes filtres. Réinitialise ta recherche pour voir plus d'annonces."
              : "Tu as parcouru toutes les annonces disponibles. Reviens bientôt, de nouvelles annonces arrivent."}
          </p>
          {likes.length > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-pink-light">
              <Check className="h-4 w-4" strokeWidth={3} />
              {likes.length} annonce{likes.length > 1 ? "s" : ""} aimée
              {likes.length > 1 ? "s" : ""}
            </p>
          )}
          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            {filtresActifs && (
              <button
                onClick={reinitialiserFiltres}
                className="bg-metal rounded-full px-6 py-3 font-semibold text-white"
              >
                Réinitialiser ma recherche
              </button>
            )}
            <button
              onClick={() => setFiltresOuverts(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel px-6 py-3 font-medium text-ink/80 hover:border-ink/30"
            >
              <SlidersHorizontal className="h-[18px] w-[18px]" /> Ajuster mes filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full flex-1 min-h-0">
          {/* Le défilement vertical fait passer d'une annonce à l'autre (snap).
              Défiler ne décide rien : on peut remonter librement. */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {feed.map((l, i) => {
              const dec = decisions[l.id];
              const proche = Math.abs(i - activeIndex) <= FENETRE;
              return (
                <div
                  key={l.id}
                  className="relative h-full w-full snap-start snap-always"
                >
                  {proche && (
                    <>
                      <div
                        className={
                          "h-full w-full transition-[transform,opacity] duration-300 " +
                          (sortie?.id === l.id
                            ? sortie.dir === "up"
                              ? "-translate-y-full opacity-0"
                              : "translate-y-full opacity-0"
                            : "")
                        }
                        onClick={() => {
                          fermerHintTap();
                          if (flou) setPaywall(true);
                          else setDetail(l);
                        }}
                      >
                        <ListingCard
                          listing={l}
                          compat={compatAnnonce(profile, l)}
                          flou={flou}
                        />
                      </div>

                      {/* Marque "Aimé" / "Passé" si on a déjà décidé (revenir en
                          arrière reste possible, l'annonce reste affichée). */}
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

          {/* Colonne d'icônes à droite (style TikTok) : agit sur l'annonce visible.
              Ordre inversé : le J'aime est tout en bas (sous le pouce). */}
          {active && !flou && (
            <div className="absolute bottom-10 right-3 z-30 flex flex-col items-center gap-2.5">
              <ColBtn label="Filtres" onClick={() => setFiltresOuverts(true)}>
                <SlidersHorizontal className="h-[18px] w-[18px]" />
                {filtresActifs && (
                  <span className="bg-signature absolute right-1 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white" />
                )}
              </ColBtn>
              <ColBtn label="Partager" onClick={() => partagerAnnonce(active)}>
                <Share2 className="h-[18px] w-[18px]" />
              </ColBtn>
              <ColBtn
                label="Garder"
                title="Mettre en favori"
                onClick={() => basculerFavori(active)}
              >
                <Bookmark
                  className="h-[18px] w-[18px]"
                  fill={favorisIds.has(active.id) ? "currentColor" : "none"}
                />
              </ColBtn>
              <ColBtn
                label="Message"
                title="Message direct à l'annonceur (HeroSwiper)"
                disabled={contactEnCours}
                onClick={() => messageDirect(active)}
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

          {/* Indice : glisser vers le haut — seulement sur la 1re annonce ET sur
              appareil tactile (sur PC/souris on ne peut pas glisser, on le cache). */}
          {feed.length > 1 && activeIndex === 0 && !flou && tactile && (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-0.5 text-ink/60">
              <ChevronUp className="h-5 w-5 animate-bounce" />
              <span className="text-xs font-medium">Glisse vers le haut</span>
            </div>
          )}

          {/* Indice 1er passage : main animée « Touche pour voir » (s'efface au
              1er tap/défilement ou après quelques secondes, une seule fois). */}
          {hintTap && active && !flou && (
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

          {/* Pop-up « L'annonceur est notifié » (3 premiers likes), au centre */}
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

      {/* ---------- Annonce ouverte en grand (photos + détails) ---------- */}
      {detail && (
        <ListingDetail
          listing={detail}
          onClose={() => setDetail(null)}
          onLike={() => {
            const l = detail;
            setDetail(null);
            decider(l, "like");
          }}
          onPass={() => {
            const l = detail;
            setDetail(null);
            decider(l, "pass");
          }}
        />
      )}

      {/* ---------- Limite de 20 swipes / 24h atteinte ---------- */}
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
                <Check className="h-4 w-4 text-bleu" strokeWidth={3} /> Swipes
                illimités
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

// Bouton de la colonne d'actions : pastille noire remplie, symbole blanc par
// défaut. `symbolClass` permet de teinter le symbole (turquoise pour J'aime,
// corail pour Passer) tout en gardant le remplissage noir.
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
