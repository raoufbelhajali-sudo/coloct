"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Star, Smartphone, Play, Sparkles, Clock, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getListings, lieuComplet } from "@/lib/listings";
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

const PHOTOS_COLOC = [
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=70",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=70",
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
        <span className="bg-signature absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-bold text-white shadow">
          {l.loyer} €
        </span>
      </div>
      <div className="p-4">
        <p className="font-display text-lg font-semibold leading-tight">
          {l.titre || l.typeLogement || "Colocation"}
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {[l.ville, l.surface ? `${l.surface} m²` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [estNatif, setEstNatif] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    setEstNatif(Capacitor.isNativePlatform());
  }, []);

  // Déjà connecté → espace ; app native → direct à la connexion
  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace(profile.role === "locataire" ? "/locataire" : "/swipe");
    } else if (estNatif && !user) {
      router.replace("/connexion");
    }
  }, [estNatif, loading, user, profile, router]);

  useEffect(() => {
    getListings().then(setListings).catch(() => setListings([]));
  }, []);

  const aLaUne = [...listings]
    .sort((a, b) => (boostActif(b.boosted_until) ? 1 : 0) - (boostActif(a.boosted_until) ? 1 : 0))
    .slice(0, 6);
  const recentes = [...listings].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* ===== Barre de navigation ===== */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 md:flex">
            <Link href="/annonces" className="hover:text-ink">Annonces</Link>
            <a href="#avis" className="hover:text-ink">Avis</a>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#telecharger" className="hidden items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white sm:flex">
              <Smartphone className="h-4 w-4" /> iOS
            </a>
            <a href="#telecharger" className="hidden items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white sm:flex">
              <Play className="h-4 w-4" /> Android
            </a>
            <Link href="/connexion" className="bg-signature flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white">
              <Globe className="h-4 w-4" /> Appli web
            </Link>
            <Link href="/connexion" className="hidden rounded-full border border-ink/15 bg-bg px-4 py-2 text-sm font-semibold text-ink hover:border-ink/30 sm:block">
              Publier
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.14]" style={{ backgroundImage: "url(/accueil-bg.jpg)" }} />
        <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-pink">
            <Sparkles className="h-4 w-4" /> 100% gratuit
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Trouve ta colocation <span className="text-signature">en swipant</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink/70">
            Parcours les chambres en colocation partout en France. Like, matche et
            discute — l&apos;expérience complète sur l&apos;application.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/annonces" className="bg-signature glow-pink rounded-full px-8 py-4 font-semibold text-white transition-transform hover:scale-[1.03]">
              Voir les annonces
            </Link>
            <Link href="/connexion" className="rounded-full border border-ink/15 bg-bg px-8 py-4 font-semibold text-ink hover:border-ink/30">
              Publier une annonce
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Annonces à la une ===== */}
      {aLaUne.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
              <Sparkles className="h-6 w-6 text-pink" /> À la une
            </h2>
            <Link href="/annonces" className="text-sm font-medium text-pink hover:underline">Tout voir →</Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aLaUne.map((l) => <CarteAnnonce key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* ===== Annonces récentes ===== */}
      {recentes.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-10">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
            <Clock className="h-6 w-6 text-bleu" /> Vient d&apos;arriver
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentes.map((l) => <CarteAnnonce key={l.id} l={l} />)}
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
                <div className="flex gap-0.5 text-pink">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4" fill="currentColor" />)}
                </div>
                <p className="mt-3 text-ink/80">“{a.t}”</p>
                <p className="mt-3 text-sm font-semibold text-ink/60">{a.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== La vie en coloc (images) ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14">
        <h2 className="text-center font-display text-2xl font-bold md:text-3xl">La vie en colocation</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">Rencontre des colocataires qui te ressemblent.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PHOTOS_COLOC.map((p, i) => (
            <div key={i} className={"overflow-hidden rounded-2xl bg-panel-2 " + (i === 0 ? "col-span-2 sm:col-span-1" : "")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="Colocataires" className="aspect-[4/3] h-full w-full object-cover" />
            </div>
          ))}
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
            <a href="#" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink">
              <Smartphone className="h-5 w-5" /> App Store <span className="text-xs font-normal text-ink/50">(bientôt)</span>
            </a>
            <a href="#" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-ink">
              <Play className="h-5 w-5" /> Google Play <span className="text-xs font-normal text-ink/50">(bientôt)</span>
            </a>
          </div>
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

      {/* ===== Footer ===== */}
      <footer className="border-t border-ink/10 bg-panel/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
            <p className="mt-2 max-w-xs text-sm text-ink/50">Trouve ta colocation partout en France, en swipant.</p>
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
