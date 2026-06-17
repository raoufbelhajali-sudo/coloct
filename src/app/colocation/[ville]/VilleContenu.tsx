"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getListings, lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

export default function VilleContenu({ ville }: { ville: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getListings()
      .then((l) =>
        setListings(
          l.filter(
            (x) => (x.ville || "").toLowerCase() === ville.toLowerCase()
          )
        )
      )
      .catch(() => setListings([]))
      .finally(() => setChargement(false));
  }, [ville]);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/annonces" aria-label="Annonces">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <Link
            href="/connexion"
            className="bg-signature rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Publier une annonce
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Colocation à {ville}
        </h1>
        <p className="mt-2 max-w-2xl text-ink/60">
          Trouve ta chambre en co/location à {ville} en swipant. Like les annonces
          qui te plaisent, matche et discute — 100% gratuit, sur
          l&apos;application FlatSwiper.
        </p>

        {chargement ? (
          <p className="mt-16 text-center text-ink/50">Chargement…</p>
        ) : listings.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-panel p-8 text-center">
            <p className="text-ink/70">
              Pas encore d&apos;annonce à {ville}. Reviens bientôt, ou{" "}
              <Link href="/annonces" className="text-pink underline">
                vois toutes les villes
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <Link
                key={l.id}
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
                    {[l.ville, l.surface ? `${l.surface} m²` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-ink/10 bg-panel/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-8 text-center text-sm text-ink/60 md:flex-row md:justify-between md:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="FlatSwiper" className="h-6 w-auto" />
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/annonces" className="hover:text-ink">
              Toutes les annonces
            </Link>
            <Link href="/mentions-legales" className="hover:text-ink">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-ink">
              Confidentialité
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
