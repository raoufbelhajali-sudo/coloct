"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getListings, lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

// Villes avec une page dédiée (SEO)
const VILLES_SEO = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Bordeaux",
  "Lille",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Rennes",
  "Nice",
  "Grenoble",
];

export default function AnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ville, setVille] = useState("");

  useEffect(() => {
    getListings()
      .then((l) => setListings(l))
      .catch(() => setListings([]))
      .finally(() => setChargement(false));
  }, []);

  const villes = Array.from(
    new Set(listings.map((l) => l.ville).filter(Boolean) as string[])
  ).sort();
  const filtrees = ville ? listings.filter((l) => l.ville === ville) : listings;

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="Accueil">
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
          Colocations disponibles
        </h1>
        <p className="mt-2 text-ink/60">
          Parcours les chambres en colocation. Pour matcher et discuter,
          télécharge l&apos;application.
        </p>

        {/* Filtre ville */}
        {villes.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setVille("")}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                (!ville
                  ? "bg-signature text-white"
                  : "bg-panel text-ink/70 hover:bg-panel-2")
              }
            >
              Toutes
            </button>
            {villes.map((v) => (
              <button
                key={v}
                onClick={() => setVille(v)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                  (ville === v
                    ? "bg-signature text-white"
                    : "bg-panel text-ink/70 hover:bg-panel-2")
                }
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Grille d'annonces */}
        {chargement ? (
          <p className="mt-16 text-center text-ink/50">Chargement…</p>
        ) : filtrees.length === 0 ? (
          <p className="mt-16 text-center text-ink/50">
            Aucune annonce pour le moment.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrees.map((l) => (
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
        {/* Colocation par ville (liens SEO) */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            Colocation par ville
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {VILLES_SEO.map((v) => (
              <Link
                key={v}
                href={`/colocation/${v.toLowerCase()}`}
                className="rounded-full bg-panel px-4 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-panel-2"
              >
                Colocation à {v}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-panel/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-8 text-center text-sm text-ink/60 md:flex-row md:justify-between md:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="FlatSwiper" className="h-6 w-auto" />
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/connexion" className="hover:text-ink">
              Se connecter
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
