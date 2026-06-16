"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getListings, lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

const PHOTO_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

export default function LocationPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ville, setVille] = useState("");

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setChargement(false));
  }, []);

  // Uniquement les annonces de type "location" (logement entier)
  const locations = useMemo(
    () => listings.filter((l) => (l.typeOffre ?? "colocation") === "location"),
    [listings]
  );
  const villes = Array.from(
    new Set(locations.map((l) => l.ville).filter(Boolean) as string[])
  ).sort();
  const filtrees = ville ? locations.filter((l) => l.ville === ville) : locations;

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold md:text-4xl">
          <Home className="h-8 w-8 text-bleu" /> Locations disponibles
        </h1>
        <p className="mt-2 text-ink/60">
          Des logements entiers à louer (pas de colocation). Pour visiter et
          contacter, télécharge l&apos;application.
        </p>

        {/* Filtre ville */}
        <div className="mt-6 max-w-xs">
          <label className="mb-1 block text-xs font-medium text-ink/55">Ville</label>
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-panel px-3 py-2.5 text-sm focus:border-pink focus:outline-none"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {!chargement && (
          <p className="mt-4 text-sm text-ink/55">
            {filtrees.length} location{filtrees.length > 1 ? "s" : ""}
            {ville ? ` à ${ville}` : ""}
          </p>
        )}

        {chargement ? (
          <p className="mt-16 text-center text-ink/50">Chargement…</p>
        ) : filtrees.length === 0 ? (
          <p className="mt-16 text-center text-ink/50">
            Aucune location pour le moment. Reviens bientôt&nbsp;!
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
                    {l.titre || l.typeLogement || "Location"}
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
    </div>
  );
}
