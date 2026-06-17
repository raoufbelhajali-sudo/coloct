"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight, MapPin, X, Heart, Maximize2,
  Ruler, Home, Sofa, Wifi, Car, Dumbbell, WashingMachine, Sparkles,
  Snowflake, Tv, UtensilsCrossed, Check, PiggyBank, Images, Smartphone, Play,
} from "lucide-react";
import { getListingById, lieuComplet } from "@/lib/listings";
import SiteHeader from "@/components/SiteHeader";
import MiniMap from "@/components/MiniMap";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=70";

// Seuil "petit budget" (loyer mensuel charges comprises)
const PETIT_BUDGET = 600;

// Associe un service à une icône (cohérent avec l'app)
function iconeService(s: string) {
  const k = s.toLowerCase();
  if (k.includes("wifi") || k.includes("fibre") || k.includes("internet")) return Wifi;
  if (k.includes("parking") || k.includes("garage")) return Car;
  if (k.includes("sport") || k.includes("salle de sport") || k.includes("gym")) return Dumbbell;
  if (k.includes("laver") || k.includes("linge") || k.includes("laverie")) return WashingMachine;
  if (k.includes("ménage") || k.includes("menage") || k.includes("nettoy")) return Sparkles;
  if (k.includes("clim")) return Snowflake;
  if (k.includes("tv") || k.includes("télé") || k.includes("tele")) return Tv;
  if (k.includes("cuisine") || k.includes("équipée") || k.includes("equipee")) return UtensilsCrossed;
  return Check;
}

function AnnonceContenu() {
  const params = useSearchParams();
  const id = params.get("id");
  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);
  const galerie = useRef<HTMLDivElement>(null);

  const [lightbox, setLightbox] = useState<number | null>(null); // index photo ouverte
  const [popup, setPopup] = useState(false); // pop-up "ça m'intéresse"
  const [descOuverte, setDescOuverte] = useState(false);

  useEffect(() => {
    if (!id) {
      setChargement(false);
      return;
    }
    getListingById(id)
      .then((l) => setListing(l))
      .catch(() => setListing(null))
      .finally(() => setChargement(false));
  }, [id]);

  function defiler(sens: number) {
    const el = galerie.current;
    if (el) el.scrollBy({ left: sens * el.clientWidth, behavior: "smooth" });
  }

  if (chargement) {
    return <p className="mt-20 text-center text-ink/50">Chargement…</p>;
  }
  if (!listing) {
    return (
      <div className="mt-20 text-center">
        <p className="text-ink/60">Annonce introuvable.</p>
        <Link href="/annonces" className="mt-3 inline-block text-pink underline">
          Voir toutes les annonces
        </Link>
      </div>
    );
  }

  const photos = listing.photos?.length ? listing.photos : [PHOTO_DEFAUT];
  const petitBudget = listing.loyer > 0 && listing.loyer <= PETIT_BUDGET;

  // Caractéristiques principales (icônes)
  const specs = [
    { Icon: Home, label: listing.typeLogement || "Colocation" },
    listing.surface ? { Icon: Ruler, label: `${listing.surface} m²` } : null,
    { Icon: Sofa, label: listing.meuble ? "Meublé" : "Non meublé" },
    listing.ville || listing.quartier
      ? { Icon: MapPin, label: listing.ville || listing.quartier }
      : null,
  ].filter(Boolean) as { Icon: typeof Home; label: string }[];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-6">
      <Link
        href="/annonces"
        className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Toutes les annonces
      </Link>

      {/* ---------- Galerie ---------- */}
      <div className="relative">
        {/* Desktop : grille 1 grande + 4 vignettes (façon Studapart) */}
        <div className="hidden gap-2 sm:grid sm:grid-cols-4 sm:grid-rows-2">
          <button
            onClick={() => setLightbox(0)}
            className="relative col-span-2 row-span-2 overflow-hidden rounded-l-3xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[0]} alt="Photo 1" className="h-full w-full object-cover" />
          </button>
          {[1, 2, 3, 4].map((i, k) => (
            <button
              key={i}
              onClick={() => setLightbox(Math.min(i, photos.length - 1))}
              className={
                "relative overflow-hidden " +
                (k === 1 ? "rounded-tr-3xl " : "") +
                (k === 3 ? "rounded-br-3xl " : "")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[Math.min(i, photos.length - 1)] || photos[0]}
                alt={`Photo ${i + 1}`}
                className="h-full min-h-[140px] w-full object-cover"
              />
              {k === 3 && photos.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-lg font-bold text-white">
                  +{photos.length - 5}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile : carrousel */}
        <div className="relative overflow-hidden rounded-3xl sm:hidden">
          <div
            ref={galerie}
            className="flex h-72 snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="h-72 w-full shrink-0 snap-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt={`Photo ${i + 1}`} className="h-72 w-full object-cover" />
              </button>
            ))}
          </div>
          {photos.length > 1 && (
            <>
              <button onClick={() => defiler(-1)} aria-label="Précédente"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/70 text-ink shadow backdrop-blur-sm">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={() => defiler(1)} aria-label="Suivante"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/70 text-ink shadow backdrop-blur-sm">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Bouton "voir les photos" + badge petit budget */}
        <button
          onClick={() => setLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-bg/85 px-3.5 py-2 text-sm font-semibold text-ink shadow backdrop-blur-sm hover:bg-bg"
        >
          <Images className="h-4 w-4" /> {photos.length} photo{photos.length > 1 ? "s" : ""}
        </button>
        {petitBudget && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-signature px-3 py-1.5 text-sm font-bold text-white shadow">
            <PiggyBank className="h-4 w-4" /> Petit budget
          </span>
        )}
      </div>

      {/* ---------- Contenu en 2 colonnes (façon Studapart) ---------- */}
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Colonne gauche : détails */}
        <div className="lg:col-span-2">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {listing.titre || listing.typeLogement || "Colocation"}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-ink/70">
            <MapPin className="h-4 w-4 text-bleu" /> {lieuComplet(listing)}
          </p>

          {/* Caractéristiques (icônes) */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-panel px-2 py-3 text-center">
                <Icon className="h-6 w-6 text-bleu" />
                <span className="text-xs font-medium text-ink/80">{label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {listing.description ? (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold">Description</h2>
              <p className={"mt-2 whitespace-pre-line text-ink/80 " + (descOuverte ? "" : "line-clamp-4")}>
                {listing.description}
              </p>
              {listing.description.length > 220 && (
                <button onClick={() => setDescOuverte((v) => !v)} className="mt-1 text-sm font-semibold text-pink hover:underline">
                  {descOuverte ? "Voir moins" : "Voir plus"}
                </button>
              )}
            </div>
          ) : null}

          {/* Services / équipements (icônes) */}
          {listing.services?.length ? (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold">Équipements & services</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.services.map((s) => {
                  const Icon = iconeService(s);
                  return (
                    <div key={s} className="flex items-center gap-2.5 rounded-xl bg-panel px-3 py-2.5 text-sm text-ink/80">
                      <Icon className="h-5 w-5 shrink-0 text-bleu" /> {s}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Carte de localisation (approximative, au niveau de la ville) */}
          {listing.lat != null && listing.lng != null && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold">Localisation</h2>
              <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-ink/10">
                <MiniMap lat={listing.lat} lng={listing.lng} className="h-64 w-full" />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/50">
                <MapPin className="h-3.5 w-3.5 text-violet" /> Localisation
                approximative · {lieuComplet(listing)}
              </p>
            </div>
          )}
        </div>

        {/* Colonne droite : prix + CTA (collant sur desktop) */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-ink/10 bg-bg p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-end gap-1">
              <span className="font-display text-3xl font-bold text-ink">{listing.loyer} €</span>
              <span className="mb-1 text-sm text-ink/60">/ mois</span>
            </div>
            <p className="mt-0.5 text-sm text-ink/55">Charges comprises</p>
            {petitBudget && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-pink">
                <PiggyBank className="h-4 w-4" /> Idéal petit budget
              </p>
            )}
            <button
              onClick={() => setPopup(true)}
              className="bg-signature glow-pink mt-4 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <Heart className="h-5 w-5" fill="currentColor" /> Ça m&apos;intéresse
            </button>
            <p className="mt-3 text-center text-xs text-ink/50">
              Like, match et messagerie dans l&apos;app FlatSwiper
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Lightbox plein écran ---------- */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} aria-label="Fermer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightbox]} alt={`Photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
                aria-label="Précédente"
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
                aria-label="Suivante"
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <ChevronRight className="h-7 w-7" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
                {lightbox + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
      )}

      {/* ---------- Pop-up "Ça m'intéresse" → télécharge l'app ---------- */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm" onClick={() => setPopup(false)}>
          <div className="relative w-full max-w-sm rounded-3xl bg-bg p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPopup(false)} aria-label="Fermer"
              className="absolute right-4 top-4 text-ink/40 hover:text-ink">
              <X className="h-5 w-5" />
            </button>
            <div className="bg-signature glow-pink mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <Heart className="h-8 w-8 text-white" fill="currentColor" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Cette coloc t&apos;intéresse&nbsp;?</h2>
            <p className="mt-2 text-ink/75">
              Like cette annonce, <strong>matche</strong>{" "}
              avec l&apos;annonceur et discute — tout se passe dans l&apos;app
              FlatSwiper. La co/location à petit budget, en un swipe.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <a href="/connexion" onClick={() => setPopup(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white">
                <Smartphone className="h-5 w-5" /> Télécharger sur iPhone
              </a>
              <a href="/connexion" onClick={() => setPopup(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink">
                <Play className="h-5 w-5" /> Bientôt sur Google Play
              </a>
              <Link href="/connexion" className="mt-1 text-sm font-semibold text-pink hover:underline">
                ou continuer sur l&apos;app web →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AnnoncePage() {
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />
      <Suspense fallback={<p className="mt-20 text-center text-ink/50">Chargement…</p>}>
        <AnnonceContenu />
      </Suspense>
    </div>
  );
}
