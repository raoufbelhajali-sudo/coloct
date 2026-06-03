"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { getMyMatches, type MatchSummary } from "@/lib/messages";

export default function MatchsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getMyMatches(user.id)
      .then(setMatches)
      .finally(() => setChargement(false));
  }, [user]);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <AppHeader />

      <div className="w-full max-w-sm">
        <h1 className="mb-5 font-display text-3xl font-semibold">Mes matchs</h1>

        {chargement ? (
          <p className="text-ink/60">Chargement…</p>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl bg-panel p-6 text-center text-ink/70">
            <p className="text-4xl">💘</p>
            <p className="mt-3">
              Pas encore de match. Continue à swiper, ça va arriver !
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/matchs/${m.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-panel p-3 transition-colors hover:bg-panel-2"
                >
                  {/* Vignette */}
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.titre}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="bg-signature flex h-16 w-16 items-center justify-center rounded-xl font-display text-2xl font-bold text-white">
                      {m.autrePrenom.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{m.titre}</p>
                    <p className="truncate text-sm text-ink/60">{m.sousTitre}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
