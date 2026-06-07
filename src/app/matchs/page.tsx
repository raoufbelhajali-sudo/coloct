"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import {
  getMyMatches,
  getMatchesActivite,
  type MatchSummary,
} from "@/lib/messages";
import { estMatchNonLu } from "@/lib/notifications";

export default function MatchsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [nonLus, setNonLus] = useState<Set<number>>(new Set());
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyMatches(user.id), getMatchesActivite(user.id)])
      .then(([mats, activite]) => {
        setMatches(mats);
        const set = new Set<number>();
        for (const a of activite) {
          if (estMatchNonLu(user.id, a.matchId, a.dernierAutreMsg)) {
            set.add(a.matchId);
          }
        }
        setNonLus(set);
      })
      .finally(() => setChargement(false));
  }, [user]);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-6">
      <AppHeader />

      <div className="w-full max-w-sm">
        <h1 className="mb-5 font-display text-3xl font-semibold">Mes matchs</h1>

        {chargement ? (
          <p className="text-ink/60">Chargement…</p>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-panel p-6 text-center text-ink/70">
            <HeartHandshake className="h-10 w-10 text-pink" />
            <p className="mt-3">
              Pas encore de match. Continue à swiper, ça va arriver !
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((m) => {
              const nonLu = nonLus.has(m.id);
              return (
                <li key={m.id}>
                  <Link
                    href={`/matchs/${m.id}`}
                    className={
                      "flex items-center gap-4 rounded-2xl p-3 transition-colors " +
                      (nonLu
                        ? "bg-[#ffcdb6] hover:bg-[#ffc0a3]"
                        : "bg-panel hover:bg-panel-2")
                    }
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.titre}</p>
                      <p
                        className={
                          "truncate text-sm " +
                          (nonLu ? "font-semibold text-ink" : "text-ink/60")
                        }
                      >
                        {m.sousTitre}
                      </p>
                    </div>
                    {/* Pastille "non lu" */}
                    {nonLu && (
                      <span className="bg-signature h-2.5 w-2.5 shrink-0 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
