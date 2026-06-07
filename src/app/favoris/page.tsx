"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, X } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingDetail from "@/components/ListingDetail";
import { useAuth } from "@/lib/auth";
import { getFavorisListings, retirerFavori } from "@/lib/favoris";
import { lieuComplet } from "@/lib/listings";
import type { Listing } from "@/data/listings";

export default function FavorisPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favoris, setFavoris] = useState<Listing[]>([]);
  const [chargement, setChargement] = useState(true);
  const [detail, setDetail] = useState<Listing | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getFavorisListings(user.id)
      .then(setFavoris)
      .finally(() => setChargement(false));
  }, [user]);

  async function retirer(id: string) {
    if (!user) return;
    setFavoris((prev) => prev.filter((l) => l.id !== id));
    await retirerFavori(user.id, id);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-6">
      <AppHeader />

      <div className="w-full max-w-sm">
        <h1 className="mb-5 font-display text-3xl font-semibold">Mes favoris</h1>

        {chargement ? (
          <p className="text-ink/60">Chargement…</p>
        ) : favoris.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-panel p-6 text-center text-ink/70">
            <Bookmark className="h-10 w-10 text-violet" />
            <p className="mt-3">
              Aucune annonce en favori. Pendant le swipe, touche l&apos;icône
              signet pour en sauvegarder.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {favoris.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-4 rounded-2xl bg-panel p-3"
              >
                <button
                  onClick={() => setDetail(l)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  {l.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photos[0]}
                      alt={l.quartier}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="bg-signature h-16 w-16 rounded-xl" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{lieuComplet(l)}</p>
                    <p className="text-sm text-ink/60">{l.loyer} € / mois</p>
                  </div>
                </button>
                <button
                  onClick={() => retirer(l.id)}
                  aria-label="Retirer des favoris"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-panel-2 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {detail && (
        <ListingDetail listing={detail} preview onClose={() => setDetail(null)} />
      )}
    </main>
  );
}
