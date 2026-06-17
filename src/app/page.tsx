"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";
import { Star, Smartphone, Play, Sparkles, Layers, Heart, MessageCircle, KeyRound, PiggyBank, Users, Search, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth, type Profile } from "@/lib/auth";
import { getListings, lieuComplet } from "@/lib/listings";
import { getColocatairesPublics } from "@/lib/colocataires";
import { boostActif } from "@/lib/offers";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

const VILLES_SEO = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille",
  "Nantes", "Strasbourg", "Montpellier", "Rennes", "Nice", "Grenoble",
];

const AVIS = [
  { n: "Camille, 23 ans", t: "J'ai trouvé ma coloc à Lyon en 3 jours. Le swipe, c'est addictif et tellement plus simple que les annonces classiques !" },
  { n: "Yanis, 25 ans", t: "Enfin une appli où je vois le profil et les photos avant de discuter. Zéro prise de tête, que des gens motivés." },
  { n: "Sophie, annonceuse", t: "J'ai loué ma chambre super vite, et surtout j'ai pu choisir la personne. Je recommande à 100%." },
];

// Aperçus de l'app (captures générées) affichés sur l'accueil
const APERCUS = [
  { img: "/app-swipe.png", t: "Swipe", d: "Parcours les colocs près de chez toi." },
  { img: "/app-match.png", t: "Matche", d: "Quand c'est réciproque, c'est un match." },
  { img: "/app-chat.png", t: "Discute", d: "Une messagerie intégrée et sécurisée." },
];

const ETAPES = [
  { Icon: Layers, t: "Parcours", d: "Swipe les co/locations près de chez toi, comme une appli de rencontre." },
  { Icon: Heart, t: "Like & matche", d: "« Ça m'intéresse » à droite. Si l'annonceur aussi, c'est un match." },
  { Icon: MessageCircle, t: "Discute", d: "Échange en direct dans la messagerie, sans donner ton numéro." },
  { Icon: KeyRound, t: "Emménage", d: "Organise la visite et installe-toi dans ta nouvelle coloc." },
];

// Loyers indicatifs (charges comprises) d'une chambre en colocation · 2025
const PRIX_VILLES = [
  { v: "Paris", p: 750 }, { v: "Lyon", p: 520 }, { v: "Bordeaux", p: 480 },
  { v: "Toulouse", p: 430 }, { v: "Lille", p: 450 }, { v: "Marseille", p: 420 },
  { v: "Nantes", p: 440 }, { v: "Montpellier", p: 430 }, { v: "Rennes", p: 440 },
  { v: "Strasbourg", p: 440 }, { v: "Nice", p: 520 }, { v: "Grenoble", p: 420 },
];

function CarteAnnonce({ l }: { l: Listing }) {
  return (
    <Link
      href={`/annonce/?id=${l.id}`}
      className="group overflow-hidden rounded-2xl bg-panel ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={l.photos?.[0] || PHOTO_DEFAUT}
          alt={lieuComplet(l)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="bg-signature absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow">
          {l.loyer} €
        </span>
        <span
          className={
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow " +
            ((l.typeOffre ?? "colocation") === "location"
              ? "bg-[#2563eb]"
              : "bg-[#14b8a6]")
          }
        >
          {(l.typeOffre ?? "colocation") === "location" ? "Location" : "Colocation"}
        </span>
      </div>
      <div className="p-2.5">
        <p className="truncate font-display text-sm font-semibold leading-tight">
          {l.titre || l.typeLogement || "Colocation"}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink/60">
          {[l.ville, l.surface ? `${l.surface} m²` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [estNatif, setEstNatif] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [colocataires, setColocataires] = useState<Profile[]>([]);
  const [sVille, setSVille] = useState("");
  const [sBudget, setSBudget] = useState("");

  useEffect(() => {
    // Détection "app native" par 2 moyens (au cas où isNativePlatform serait pris
    // en défaut) : le plugin Capacitor OU le protocole de l'URL (capacitor://…).
    setEstNatif(
      Capacitor.isNativePlatform() ||
        (typeof location !== "undefined" && location.protocol === "capacitor:")
    );
  }, []);

  // Sur le WEB : on laisse toujours voir l'accueil (site d'annonces), même
  // connecté → le bouton "Accueil" de l'app y ramène. Dans l'APP native :
  // connecté → son espace ; sinon → connexion.
  useEffect(() => {
    if (loading) return;
    if (!estNatif) return; // web : pas de redirection, on affiche le site
    // Dans l'app native, on ne reste JAMAIS sur la page d'accueil web :
    // - connecté → /bienvenue (qui route vers l'inscription, le swipe ou l'espace) ;
    // - non connecté → /connexion.
    if (user) {
      router.replace("/bienvenue/");
    } else {
      router.replace("/connexion/");
    }
  }, [estNatif, loading, user, router]);

  useEffect(() => {
    getListings().then(setListings).catch(() => setListings([]));
    getColocatairesPublics(10).then(setColocataires).catch(() => setColocataires([]));
  }, []);

  // Page d'accueil : max 10 annonces + 10 profils (cartes compactes)
  const aLaUne = [...listings]
    .sort((a, b) => (boostActif(b.boosted_until) ? 1 : 0) - (boostActif(a.boosted_until) ? 1 : 0))
    .slice(0, 10);
  // Séparé par type pour montrer colocations ET locations
  const colocations = aLaUne.filter((l) => (l.typeOffre ?? "colocation") !== "location");
  const locations = aLaUne.filter((l) => (l.typeOffre ?? "colocation") === "location");
  const villesDispo = Array.from(
    new Set(listings.map((l) => l.ville).filter(Boolean) as string[])
  ).sort();
  function rechercher() {
    const params = new URLSearchParams();
    if (sVille) params.set("ville", sVille);
    if (sBudget) params.set("budget", sBudget);
    const q = params.toString();
    router.push(`/annonces${q ? "?" + q : ""}`);
  }

  // Dans l'app native : on n'affiche JAMAIS la page d'accueil web (la redirection
  // ci-dessus envoie vers /connexion ou /bienvenue). Page vide en attendant.
  if (estNatif) return null;

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-pink/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 md:py-16 lg:grid-cols-2">
          {/* Gauche : texte + recherche */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-pink">
              <Sparkles className="h-4 w-4" /> 100% gratuit · partout en France
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              Colocation ou location, <span className="text-signature">trouve en swipant</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink/70">
              Parcours les colocations et les locations, like, matche et discute.
              Le logement à petit budget, en un swipe.
            </p>

            {/* Barre de recherche */}
            <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-panel p-2 ring-1 ring-ink/5 sm:flex-row sm:items-center">
              <select
                value={sVille}
                onChange={(e) => setSVille(e.target.value)}
                className="flex-1 rounded-xl bg-bg px-4 py-3 text-sm text-ink focus:outline-none"
              >
                <option value="">Toutes les villes</option>
                {villesDispo.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select
                value={sBudget}
                onChange={(e) => setSBudget(e.target.value)}
                className="rounded-xl bg-bg px-4 py-3 text-sm text-ink focus:outline-none"
              >
                <option value="">Budget max</option>
                <option value="500">≤ 500 €</option>
                <option value="700">≤ 700 €</option>
                <option value="900">≤ 900 €</option>
              </select>
              <button
                onClick={rechercher}
                className="bg-signature flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <Search className="h-4 w-4" /> Rechercher
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <Link href="/annonces" className="font-semibold text-pink hover:underline">
                Voir toutes les annonces →
              </Link>
              <span className="text-ink/25">·</span>
              <Link href="/connexion" className="font-semibold text-ink/70 hover:text-ink">
                Publier une annonce
              </Link>
            </div>
          </motion.div>

          {/* Droite : image + carte "match" flottante animée */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mt-2 lg:mt-0"
          >
            <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/accueil-bg.jpg" alt="Co/locataires heureux" className="aspect-[16/10] h-full w-full object-cover sm:aspect-[4/3]" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-3 left-3 flex items-center gap-3 rounded-2xl bg-bg p-3 pr-5 shadow-lg ring-1 ring-ink/5 lg:-bottom-5 lg:-left-5"
            >
              <span className="bg-signature glow-pink flex h-11 w-11 items-center justify-center rounded-full text-white">
                <Heart className="h-5 w-5" fill="currentColor" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">C&apos;est un match&nbsp;!</p>
                <p className="text-xs text-ink/55">Lancez la conversation</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== Comment ça marche ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <h2 className="text-center font-display text-2xl font-bold md:text-3xl">Comment ça marche&nbsp;?</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-ink/60">Trouver une coloc n&apos;a jamais été aussi simple. En 4 étapes.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map(({ Icon, t, d }, i) => (
            <div key={t} className="relative rounded-3xl bg-panel p-6 pt-7 text-center">
              <span className="bg-signature absolute -top-3.5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">{i + 1}</span>
              <Icon className="mx-auto h-9 w-9 text-bleu" />
              <p className="mt-3 font-display text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-ink/65">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Colocations à la une ===== */}
      {colocations.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
              <Sparkles className="h-6 w-6 text-bleu" /> Colocations à la une
            </h2>
            <Link href="/annonces" className="text-sm font-medium text-pink hover:underline">Tout voir →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {colocations.map((l) => <CarteAnnonce key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* ===== Locations à la une ===== */}
      {locations.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
              <Sparkles className="h-6 w-6 text-pink" /> Locations à la une
            </h2>
            <Link href="/location" className="text-sm font-medium text-pink hover:underline">Tout voir →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {locations.map((l) => <CarteAnnonce key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* ===== Aperçu de l'app (captures) ===== */}
      <section className="overflow-hidden bg-panel/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold text-pink">
              <Smartphone className="h-4 w-4" /> L&apos;app en images
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">À quoi ressemble FlatSwiper&nbsp;?</h2>
            <p className="mx-auto mt-2 max-w-xl text-ink/65">
              Swipe, matche, discute — tout se passe dans l&apos;app, simplement.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-8">
            {APERCUS.map(({ img, t, d }, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={"flex flex-col items-center text-center " + (i === 1 ? "sm:-translate-y-4" : "")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={t} className="w-full max-w-[230px] drop-shadow-xl" />
                <p className="mt-3 font-display text-sm font-bold sm:text-lg">{t}</p>
                <p className="mt-0.5 hidden max-w-[18ch] text-sm text-ink/60 sm:block">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Colocataires en recherche ===== */}
      {colocataires.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
              <Users className="h-6 w-6 text-bleu" /> Co/locataires en recherche
            </h2>
            <Link href="/colocataires" className="text-sm font-medium text-pink hover:underline">Tout voir →</Link>
          </div>
          <p className="mt-1 text-ink/60">Tu as une chambre&nbsp;? Voici qui cherche une coloc.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {colocataires.map((p) => (
              <Link
                key={p.id}
                href={`/colocataire/?id=${p.id}`}
                className="group overflow-hidden rounded-2xl bg-panel ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
                  {p.photo_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.photo_url} alt={p.prenom} className="h-full w-full scale-110 object-cover blur-lg" />
                  )}
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-bg/75 text-ink/70 backdrop-blur">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  {p.budget_max ? (
                    <span className="bg-signature absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow">
                      ≤ {p.budget_max} €
                    </span>
                  ) : null}
                </div>
                <div className="p-2.5">
                  <p className="truncate font-display text-sm font-semibold leading-tight">
                    {p.prenom}
                    {p.age ? <span className="font-normal text-ink/55">, {p.age}</span> : null}
                  </p>
                  {p.ville && <p className="mt-0.5 truncate text-xs text-ink/55">{p.ville}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Avis / témoignages ===== */}
      <section id="avis" className="bg-panel/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">Ils ont trouvé leur coloc</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {AVIS.map((a) => (
              <div key={a.n} className="rounded-3xl bg-bg p-6 shadow-sm ring-1 ring-ink/5">
                <div className="flex gap-0.5 text-bleu">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4" fill="currentColor" />)}
                </div>
                <p className="mt-3 text-ink/80">“{a.t}”</p>
                <p className="mt-3 text-sm font-semibold text-ink/60">{a.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Télécharger l'app ===== */}
      <section id="telecharger" className="px-5">
        <div className="bg-signature glow-pink mx-auto w-full max-w-6xl rounded-3xl px-8 py-12 text-center text-white md:py-14">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Le swipe, c&apos;est dans l&apos;app</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Télécharge FlatSwiper pour liker, matcher et discuter avec les annonceurs.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/connexion" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink">
              <Smartphone className="h-5 w-5" /> App Store <span className="text-xs font-normal text-ink/50">(bientôt)</span>
            </a>
            <a href="/connexion" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink">
              <Play className="h-5 w-5" /> Google Play <span className="text-xs font-normal text-ink/50">(bientôt)</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== Prix moyens : la coloc, le bon plan petit budget ===== */}
      <section className="bg-panel/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold text-pink">
              <PiggyBank className="h-4 w-4" /> Petit budget
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">La coloc, le bon plan pour ton budget</h2>
            <p className="mx-auto mt-2 max-w-xl text-ink/65">
              Une chambre en co/location coûte en moyenne{" "}
              <strong className="text-ink">≈ 480 €/mois</strong>{" "}
              en France — bien moins qu&apos;un studio (~750 €). Voici les loyers
              moyens par ville.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PRIX_VILLES.map(({ v, p }) => (
              <Link
                key={v}
                href={`/colocation/${v.toLowerCase()}`}
                className="flex items-center justify-between rounded-2xl bg-bg px-4 py-3 ring-1 ring-ink/5 transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-ink/80">{v}</span>
                <span className="font-display font-bold text-pink">{p} €</span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-ink/45">
            Loyers indicatifs charges comprises pour une chambre en co/location · 2025.
          </p>
        </div>
      </section>

      {/* ===== Colocation par ville (SEO) ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <h2 className="font-display text-2xl font-bold">Colocation par ville</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {VILLES_SEO.map((v) => (
            <Link key={v} href={`/colocation/${v.toLowerCase()}`} className="rounded-full bg-panel px-4 py-2 text-sm font-medium text-ink/75 hover:bg-panel-2">
              Colocation à {v}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Bande illustrée (ambiance colocation / immobilier) ===== */}
      <div aria-hidden className="relative mt-6 h-36 w-full overflow-hidden sm:h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/accueil-bg.svg"
          alt=""
          className="absolute bottom-0 left-1/2 h-full w-auto min-w-[1100px] max-w-none -translate-x-1/2 object-cover object-bottom"
        />
      </div>

      {/* ===== Footer ===== */}
      <footer className="border-t border-ink/10 bg-panel/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
            <p className="mt-2 max-w-xs text-sm text-ink/50">Trouve ta co/location partout en France, en swipant.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
            <Link href="/annonces" className="hover:text-ink">Annonces</Link>
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
