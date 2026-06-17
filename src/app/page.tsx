"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, Handshake, House, X, MessageCircle, KeyRound, Layers,
  Star, MapPin, ArrowRight, Quote, Rocket, ShieldCheck, Lock,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";

/* ============================================================
   Page d'accueil = LANDING (vitrine) façon Tinder.
   - Tout est statique : annonces & profils sont des EXEMPLES
     non cliquables (on ne peut pas les ouvrir).
   - Animations : pile de cartes qui se "swipe" toute seule,
     révélations au défilement.
   ============================================================ */

const UNS = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

type Demo = {
  id: number;
  titre: string;
  ville: string;
  prix: number;
  surface: number;
  type: "colocation" | "location";
  meuble?: boolean;
  photo: string;
};

// Annonces d'exemple (non cliquables) — colocations ET locations
const ANNONCES: Demo[] = [
  { id: 1, titre: "Chambre lumineuse en coloc", ville: "Paris 11e", prix: 620, surface: 16, type: "colocation", meuble: true, photo: UNS("1505691938895-1758d7feb511") },
  { id: 2, titre: "Studio cosy République", ville: "Paris", prix: 850, surface: 26, type: "location", meuble: true, photo: UNS("1502672260266-1c1ef2d93688") },
  { id: 3, titre: "Grande coloc avec terrasse", ville: "Lyon", prix: 480, surface: 14, type: "colocation", photo: UNS("1560448204-e02f11c3d0e2") },
  { id: 4, titre: "T2 rénové Vieux-Lille", ville: "Lille", prix: 760, surface: 45, type: "location", meuble: true, photo: UNS("1493663284031-b7e3aefcae8e") },
  { id: 5, titre: "Coloc étudiante Capitole", ville: "Toulouse", prix: 410, surface: 12, type: "colocation", photo: UNS("1540518614846-7eded433c457") },
  { id: 6, titre: "T2 vue mer Promenade", ville: "Nice", prix: 1100, surface: 48, type: "location", meuble: true, photo: UNS("1567767292278-a4f21aa2d36e") },
  { id: 7, titre: "Maison en coloc + jardin", ville: "Nantes", prix: 450, surface: 15, type: "colocation", photo: UNS("1586023492125-27b2c045efd7") },
  { id: 8, titre: "Studio meublé Vieux-Port", ville: "Marseille", prix: 690, surface: 24, type: "location", meuble: true, photo: UNS("1598928506311-c55ded91a20c") },
];

// Cartes du hero qui se swipent toutes seules
const HERO_CARDS = [ANNONCES[0], ANNONCES[2], ANNONCES[6], ANNONCES[4]];

type Profil = { id: number; prenom: string; age: number; ville: string; budget: number; tag: string; photo: string };
const PROFILS: Profil[] = [
  { id: 1, prenom: "Camille", age: 23, ville: "Lyon", budget: 500, tag: "Étudiante", photo: UNS("1494790108377-be9c29b29330", 500) },
  { id: 2, prenom: "Yanis", age: 25, ville: "Paris", budget: 700, tag: "Développeur", photo: UNS("1500648767791-00dcc994a43e", 500) },
  { id: 3, prenom: "Sarah", age: 22, ville: "Toulouse", budget: 450, tag: "Infirmière", photo: UNS("1438761681033-6461ffad8d80", 500) },
  { id: 4, prenom: "Tom", age: 27, ville: "Bordeaux", budget: 600, tag: "Télétravail", photo: UNS("1507003211169-0a1dd7228f2d", 500) },
  { id: 5, prenom: "Léa", age: 24, ville: "Nantes", budget: 500, tag: "Designer", photo: UNS("1517841905240-472988babdf9", 500) },
  { id: 6, prenom: "Marco", age: 26, ville: "Lille", budget: 550, tag: "Ingénieur", photo: UNS("1506794778202-cad84cf45f1d", 500) },
];

const AVIS = [
  { n: "Camille", s: "23 ans · Lyon", photo: UNS("1494790108377-be9c29b29330", 200), t: "J'ai trouvé ma coloc à Lyon en 3 jours. Le swipe, c'est addictif et tellement plus simple que les annonces classiques !" },
  { n: "Yanis", s: "25 ans · Paris", photo: UNS("1500648767791-00dcc994a43e", 200), t: "Enfin une appli où je vois le profil et les photos avant de discuter. Zéro prise de tête, que des gens motivés." },
  { n: "Sophie", s: "Annonceuse · Bordeaux", photo: UNS("1573496359142-b8d87734a5a2", 200), t: "J'ai loué ma chambre super vite, et surtout j'ai pu choisir la personne. Je recommande à 100 %." },
];

const ETAPES = [
  { Icon: Layers, t: "Parcours", d: "Swipe les colocations et locations près de chez toi, comme une appli de rencontre." },
  { Icon: Check, t: "Like & matche", d: "« Ça m'intéresse » à droite. Si l'annonceur aussi, c'est un match." },
  { Icon: MessageCircle, t: "Discute", d: "Échangez en direct dans la messagerie, sans donner ton numéro." },
  { Icon: KeyRound, t: "Emménage", d: "Organise la visite et installe-toi dans ton nouveau chez-toi." },
];

function TypeBadge({ type }: { type: "colocation" | "location" }) {
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow " +
        (type === "location" ? "bg-[#2563eb]" : "bg-[#14b8a6]")
      }
    >
      {type === "location" ? "Location" : "Colocation"}
    </span>
  );
}

// Carte "plein écran photo" (utilisée dans la pile animée du hero)
function GrandeCarte({ d, className = "" }: { d: Demo; className?: string }) {
  return (
    <div className={"relative overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-ink/10 " + className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.photo} alt={d.titre} className="h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="bg-signature rounded-full px-2.5 py-1 text-xs font-bold text-white shadow">{d.prix} €</span>
        {d.meuble && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow">Meublé</span>}
      </div>
      <div className="absolute right-3 top-3"><TypeBadge type={d.type} /></div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="font-display text-2xl font-bold leading-tight drop-shadow">{d.titre}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
          <MapPin className="h-4 w-4" /> {d.ville} · {d.surface} m²
        </p>
      </div>
    </div>
  );
}

// Scénario joué en boucle : like (droite), non (gauche), match, non…
const ACTIONS = ["like", "nope", "match", "nope"] as const;

// La pile de cartes qui se "swipe" toute seule (cœur de la vitrine)
function PileSwipe() {
  const [i, setI] = useState(0);
  const action = ACTIONS[i % ACTIONS.length];
  const nope = action === "nope";
  const isMatch = action === "match";
  // Le match reste plus longtemps à l'écran pour qu'on voie la conversation défiler.
  useEffect(() => {
    const dur = ACTIONS[i % ACTIONS.length] === "match" ? 4600 : 2200;
    const t = setTimeout(() => setI((v) => (v + 1) % HERO_CARDS.length), dur);
    return () => clearTimeout(t);
  }, [i]);
  const top = HERO_CARDS[i];
  const n1 = HERO_CARDS[(i + 1) % HERO_CARDS.length];
  const n2 = HERO_CARDS[(i + 2) % HERO_CARDS.length];
  // Bulles de la mini-messagerie qui défile pendant le match
  const BULLES = [
    { moi: false, t: "Salut 👋 ta chambre est encore dispo ?" },
    { moi: true, t: "Oui ! Elle te plaît ?" },
    { moi: false, t: "Carrément 😍 je peux visiter ?" },
    { moi: true, t: "Demain 18h, ça te va ?" },
    { moi: false, t: "Parfait, à demain 🙌" },
  ];

  return (
    <div className="mx-auto flex flex-col items-center">
      <div className="relative h-[400px] w-[280px] sm:h-[450px] sm:w-[320px]">
        <GrandeCarte d={n2} className="absolute inset-0 -translate-y-5 scale-[0.92] opacity-50" />
        <GrandeCarte d={n1} className="absolute inset-0 -translate-y-2.5 scale-[0.96] opacity-80" />
        <AnimatePresence>
          <motion.div
            key={top.id}
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ x: nope ? -380 : 380, rotate: nope ? -20 : 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <GrandeCarte d={top} />
            {/* Tampon LIKE (droite) ou NON (gauche) */}
            {nope ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.35 }}
                className="absolute left-5 top-16 rotate-12 rounded-xl border-4 border-[#fa5252] px-3 py-1 font-display text-2xl font-bold text-[#fa5252]"
              >
                NON
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.35 }}
                className="absolute right-5 top-16 -rotate-12 rounded-xl border-4 border-[#14b8a6] px-3 py-1 font-display text-2xl font-bold text-[#14b8a6]"
              >
                LIKE
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Animation « C'est un match ! » */}
        <AnimatePresence>
          {isMatch && (
            <motion.div
              key={"match" + i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-black/40 p-4 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ scale: 0.6, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 240, damping: 17 }}
                className="w-full max-w-[230px] overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                {/* En-tête match */}
                <div className="bg-signature flex items-center gap-2 px-4 py-3 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                    <Handshake className="h-5 w-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-display text-base font-bold">C&apos;est un match&nbsp;!</p>
                    <p className="text-[11px] text-white/90">Camille · en ligne</p>
                  </div>
                </div>
                {/* Conversation qui défile */}
                <div className="relative h-[150px] overflow-hidden bg-panel/40 px-3">
                  <motion.div
                    animate={{ y: ["10%", "-60%"] }}
                    transition={{ delay: 1.3, duration: 3, ease: "easeInOut" }}
                    className="flex flex-col gap-2 py-3"
                  >
                    {BULLES.map((b, k) => (
                      <div key={k} className={"flex " + (b.moi ? "justify-end" : "justify-start")}>
                        <span
                          className={
                            "max-w-[82%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug " +
                            (b.moi ? "bg-signature text-white" : "bg-white text-ink ring-1 ring-ink/10")
                          }
                        >
                          {b.t}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boutons d'action (toujours au-dessus, jamais cachés par les cartes) */}
      <div className="relative z-20 mt-6 flex items-center gap-5">
        <motion.span
          animate={nope ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#fa5252] shadow-lg ring-1 ring-ink/5"
        >
          <X className="h-6 w-6" strokeWidth={3} />
        </motion.span>
        <motion.span
          animate={!nope ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-signature glow-pink flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        >
          <Check className="h-7 w-7" strokeWidth={3} />
        </motion.span>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [estNatif, setEstNatif] = useState(false);

  useEffect(() => {
    setEstNatif(
      Capacitor.isNativePlatform() ||
        (typeof location !== "undefined" && location.protocol === "capacitor:")
    );
  }, []);

  // Dans l'app native : on ne reste JAMAIS sur la vitrine web.
  useEffect(() => {
    if (loading || !estNatif) return;
    router.replace(user ? "/bienvenue/" : "/connexion/");
  }, [estNatif, loading, user, router]);

  if (estNatif) return null;

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* blobs colorés en fond */}
        <div className="pointer-events-none absolute -left-32 -top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#14b8a6]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#2563eb]/15 blur-3xl" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 md:py-20 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-sm font-semibold text-pink">
              <Sparkles className="h-4 w-4" /> 100 % gratuit · partout en France
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] sm:text-6xl">
              Swipe.<br />Matche.<br /><span className="text-signature">Emménage.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/70">
              Colocation ou location, trouve ton futur chez-toi en swipant.
              Tu likes, l&apos;annonceur like, et la conversation s&apos;ouvre.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/connexion"
                className="bg-signature glow-pink flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                <Rocket className="h-5 w-5" /> Créer mon compte
              </Link>
              <a
                href="#comment"
                className="flex items-center gap-2 rounded-full bg-panel px-7 py-3.5 font-semibold text-ink/80 transition-colors hover:bg-panel-2"
              >
                Comment ça marche
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-ink/50">
              <ShieldCheck className="h-4 w-4 text-bleu" /> Sans engagement · profils vérifiés · messagerie sécurisée
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PileSwipe />
          </motion.div>
        </div>
      </section>

      {/* ===================== COMMENT ÇA MARCHE ===================== */}
      <section id="comment" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">Comment ça marche&nbsp;?</h2>
          <p className="mx-auto mt-2 max-w-lg text-ink/60">Trouver son logement n&apos;a jamais été aussi simple. En 4 étapes.</p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map(({ Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative rounded-3xl bg-panel p-6 pt-8 text-center"
            >
              <span className="bg-signature absolute -top-3.5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">{i + 1}</span>
              <Icon className="mx-auto h-9 w-9 text-bleu" />
              <p className="mt-3 font-display text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-ink/65">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== EXEMPLES D'ANNONCES (non cliquables) ===================== */}
      <section className="bg-panel/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold text-pink">
              <Sparkles className="h-4 w-4" /> Colocations &amp; locations
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Des milliers de logements à swiper</h2>
            <p className="mx-auto mt-2 max-w-xl text-ink/65">Un aperçu de ce qui t&apos;attend dans l&apos;app — chambres en coloc et locations entières, partout en France.</p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ANNONCES.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                className="overflow-hidden rounded-2xl bg-bg ring-1 ring-ink/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.photo} alt={d.titre} className="h-full w-full object-cover" />
                  <span className="bg-signature absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow">{d.prix} €</span>
                  <span className="absolute right-2 top-2"><TypeBadge type={d.type} /></span>
                </div>
                <div className="p-2.5">
                  <p className="truncate font-display text-sm font-semibold leading-tight">{d.titre}</p>
                  <p className="mt-0.5 truncate text-xs text-ink/60">{d.ville} · {d.surface} m²</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-ink/40">Exemples illustratifs. Crée ton compte pour swiper les vraies annonces.</p>
        </div>
      </section>

      {/* ===================== EXEMPLES DE PROFILS (non cliquables) ===================== */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ils cherchent un logement</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink/65">Tu as une chambre ou un appart&nbsp;? Voici le genre de profils motivés que tu peux rencontrer.</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PROFILS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.07 }}
              className="overflow-hidden rounded-2xl bg-panel ring-1 ring-ink/5"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photo} alt={p.prenom} className="h-full w-full scale-110 object-cover blur-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-ink/70 backdrop-blur">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <span className="bg-signature absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white shadow">≤ {p.budget} €</span>
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                  <p className="font-display text-sm font-bold leading-tight">{p.prenom}, {p.age}</p>
                  <p className="text-[11px] text-white/85">{p.ville} · {p.tag}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES (avec photos) ===================== */}
      <section className="bg-panel/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Ils ont trouvé grâce à FlatSwiper</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AVIS.map((a, i) => (
              <motion.div
                key={a.n}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="rounded-3xl bg-bg p-6 shadow-sm ring-1 ring-ink/5"
              >
                <Quote className="h-7 w-7 text-bleu/40" fill="currentColor" />
                <p className="mt-2 text-ink/80">{a.t}</p>
                <div className="mt-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.photo} alt={a.n} className="h-11 w-11 rounded-full object-cover ring-2 ring-bg" />
                  <div>
                    <p className="text-sm font-bold">{a.n}</p>
                    <p className="text-xs text-ink/55">{a.s}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-bleu">
                    {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="h-3.5 w-3.5" fill="currentColor" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL (bandeau dégradé) ===================== */}
      <section className="px-5 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-signature glow-pink relative mx-auto w-full max-w-5xl overflow-hidden rounded-[36px] px-8 py-16 text-center text-white"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15"
          >
            <House className="h-8 w-8" />
          </motion.span>
          <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">Prêt à trouver ton chez-toi&nbsp;?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/90">Inscription en 2 minutes. Swipe, matche et discute — 100 % gratuit.</p>
          <Link
            href="/connexion"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-ink transition-transform hover:scale-[1.03]"
          >
            Commencer maintenant <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* ===================== Footer ===================== */}
      <footer className="border-t border-ink/10 bg-panel/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
            <p className="mt-2 max-w-xs text-sm text-ink/50">Trouve ta colocation ou ta location partout en France, en swipant.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
            <Link href="/blog" className="hover:text-ink">Blog</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/connexion" className="hover:text-ink">Se connecter</Link>
            <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ink">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-ink">CGU</Link>
          </nav>
        </div>
        <p className="pb-6 text-center text-xs text-ink/35">© {new Date().getFullYear()} FlatSwiper · flatswiper.com</p>
      </footer>
    </div>
  );
}
