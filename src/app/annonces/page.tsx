"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getListings, lieuComplet } from "@/lib/listings";
import { TYPES_LOGEMENT } from "@/lib/profilOptions";
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

function AnnoncesContenu() {
  const sp = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ville, setVille] = useState(sp.get("ville") ?? "");
  const [budgetMax, setBudgetMax] = useState(sp.get("budget") ?? "");
  const [type, setType] = useState("");
  const [offre, setOffre] = useState(sp.get("offre") ?? "");

  useEffect(() => {
    getListings()
      .then((l) => setListings(l))
      .catch(() => setListings([]))
      .finally(() => setChargement(false));
  }, []);

  const villes = Array.from(
    new Set(listings.map((l) => l.ville).filter(Boolean) as string[])
  ).sort();

  const filtrees = listings.filter((l) => {
    if (ville && l.ville !== ville) return false;
    if (budgetMax && l.loyer > Number(budgetMax)) return false;
    if (type && l.typeLogement !== type) return false;
    if (offre && (l.typeOffre ?? "colocation") !== offre) return false;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Co/locations disponibles
        </h1>
        <p className="mt-2 text-ink/60">
          Parcours les chambres en co/location. Pour matcher et discuter,
          télécharge l&apos;application.
        </p>

        {/* Barre de filtres */}
        <div className="mt-6 rounded-2xl bg-panel p-4 ring-1 ring-ink/5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/55">
                Type d&apos;offre
              </label>
              <select
                value={offre}
                onChange={(e) => setOffre(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-bg px-3 py-2.5 text-sm focus:border-pink focus:outline-none"
              >
                <option value="">Tout</option>
                <option value="colocation">Co/location</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/55">
                Ville
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-bg px-3 py-2.5 text-sm focus:border-pink focus:outline-none"
              >
                <option value="">Toutes les villes</option>
                {villes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/55">
                Budget max (€/mois)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Ex. 600"
                className="w-full rounded-xl border border-ink/10 bg-bg px-3 py-2.5 text-sm focus:border-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/55">
                Type de logement
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-bg px-3 py-2.5 text-sm focus:border-pink focus:outline-none"
              >
                <option value="">Tous les types</option>
                {TYPES_LOGEMENT.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(ville || budgetMax || type) && (
            <button
              onClick={() => {
                setVille("");
                setBudgetMax("");
                setType("");
              }}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-pink hover:underline"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Réinitialiser les
              filtres
            </button>
          )}
        </div>

        {/* Compteur de résultats */}
        {!chargement && (
          <p className="mt-4 text-sm text-ink/55">
            {filtrees.length} annonce{filtrees.length > 1 ? "s" : ""}
            {ville ? ` à ${ville}` : ""}
          </p>
        )}

        {/* Grille d'annonces */}
        {chargement ? (
          <p className="mt-16 text-center text-ink/50">Chargement…</p>
        ) : filtrees.length === 0 ? (
          <p className="mt-16 text-center text-ink/50">
            Aucune annonce ne correspond à ta recherche.
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
                    {l.titre || l.typeLogement || "Co/location"}
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
            Co/location par ville
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {VILLES_SEO.map((v) => (
              <Link
                key={v}
                href={`/colocation/${v.toLowerCase()}`}
                className="rounded-full bg-panel px-4 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-panel-2"
              >
                Co/location à {v}
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

export default function AnnoncesPage() {
  return (
    <Suspense fallback={<p className="mt-20 text-center text-ink/50">Chargement…</p>}>
      <AnnoncesContenu />
    </Suspense>
  );
}
