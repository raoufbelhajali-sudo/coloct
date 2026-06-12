"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { getListingById, lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

function AnnonceContenu() {
  const params = useSearchParams();
  const id = params.get("id");
  const [listing, setListing] = useState<Listing | null>(null);
  const [chargement, setChargement] = useState(true);
  const galerie = useRef<HTMLDivElement>(null);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-6">
      <Link
        href="/annonces"
        className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Toutes les annonces
      </Link>

      {/* Galerie */}
      <div className="relative overflow-hidden rounded-3xl">
        <div
          ref={galerie}
          className="flex h-80 snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={p}
              alt={`Photo ${i + 1}`}
              className="h-80 w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <button
              onClick={() => defiler(-1)}
              aria-label="Précédente"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/70 text-ink shadow backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => defiler(1)}
              aria-label="Suivante"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/70 text-ink shadow backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Infos */}
      <div className="mt-5">
        <h1 className="font-display text-2xl font-bold">
          {listing.titre || listing.typeLogement || "Colocation"}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-ink/70">
          <MapPin className="h-4 w-4 text-bleu" /> {lieuComplet(listing)}
        </p>
        <p className="bg-signature mt-3 inline-block rounded-full px-4 py-1.5 text-lg font-bold text-white">
          {listing.loyer} € <span className="text-sm font-medium opacity-90">/ mois</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {[
            listing.typeLogement,
            listing.surface ? `${listing.surface} m²` : null,
            listing.meuble ? "Meublé" : "Non meublé",
          ]
            .filter(Boolean)
            .map((t) => (
              <span key={t} className="rounded-full bg-panel px-3 py-1 text-ink/75">
                {t}
              </span>
            ))}
        </div>

        {listing.description ? (
          <p className="mt-5 whitespace-pre-line text-ink/80">
            {listing.description}
          </p>
        ) : null}

        {listing.services?.length ? (
          <div className="mt-5">
            <p className="font-semibold">Services compris</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {listing.services.map((s) => (
                <span key={s} className="rounded-full bg-panel px-3 py-1 text-ink/75">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Appel à télécharger l'app */}
      <div className="bg-signature glow-pink mt-8 rounded-3xl px-6 py-7 text-center text-white">
        <p className="font-display text-xl font-bold">
          Cette chambre t&apos;intéresse ?
        </p>
        <p className="mx-auto mt-2 max-w-sm text-white/90">
          Pour liker cette annonce, matcher et discuter avec l&apos;annonceur,
          continue sur l&apos;application FlatSwiper.
        </p>
        <Link
          href="/connexion"
          className="mt-5 inline-block rounded-full bg-white px-7 py-3.5 font-semibold text-pink"
        >
          Continuer sur l&apos;app
        </Link>
      </div>
    </main>
  );
}

export default function AnnoncePage() {
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <Suspense fallback={<p className="mt-20 text-center text-ink/50">Chargement…</p>}>
        <AnnonceContenu />
      </Suspense>
    </div>
  );
}
