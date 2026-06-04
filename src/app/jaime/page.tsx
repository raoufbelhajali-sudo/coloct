"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronRight, HeartHandshake } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ListingDetail from "@/components/ListingDetail";
import ProfileDetail from "@/components/ProfileDetail";
import { useAuth } from "@/lib/auth";
import { getLikesRecus, repondreLike, type LikeRecu } from "@/lib/likes";

export default function JaimePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [items, setItems] = useState<LikeRecu[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState<LikeRecu | null>(null);
  const [matchFait, setMatchFait] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  const charger = useCallback(async () => {
    if (!user || !profile) return;
    setChargement(true);
    const l = await getLikesRecus(user.id, profile.role);
    setItems(l);
    setChargement(false);
  }, [user, profile]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function repondre(item: LikeRecu, direction: "like" | "pass") {
    if (!user) return;
    await repondreLike(user.id, item, direction);
    setItems((prev) => prev.filter((x) => x.swipeId !== item.swipeId));
    setOuvert(null);
    if (direction === "like") {
      setMatchFait(true);
      setTimeout(() => setMatchFait(false), 4000);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <AppHeader />

      <div className="w-full max-w-sm">
        <h1 className="mb-1 flex items-center gap-2 font-display text-3xl font-semibold">
          <Sparkles className="h-6 w-6 text-pink" /> Qui vous aime
        </h1>
        <p className="mb-5 text-ink/60">
          Ces personnes t&apos;ont liké. Ouvre leur profil et décide !
        </p>

        {chargement ? (
          <p className="text-ink/60">Chargement…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-panel p-6 text-center text-ink/70">
            <Sparkles className="h-10 w-10 text-pink" />
            <p className="mt-3">
              Personne pour le moment. Continue à swiper, ça va venir !
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.swipeId}>
                <button
                  onClick={() => setOuvert(it)}
                  className="flex w-full items-center gap-4 rounded-2xl bg-panel p-3 text-left transition-colors hover:bg-panel-2"
                >
                  <Vignette item={it} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{titre(it)}</p>
                    <p className="truncate text-sm text-ink/60">{sousTitre(it)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink/40" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Détail ouvert : on accepte (like) ou on passe */}
      {ouvert?.kind === "listing" && (
        <ListingDetail
          listing={ouvert.listing}
          onClose={() => setOuvert(null)}
          onLike={() => repondre(ouvert, "like")}
          onPass={() => repondre(ouvert, "pass")}
        />
      )}
      {ouvert?.kind === "profile" && (
        <ProfileDetail
          profile={ouvert.profile}
          onClose={() => setOuvert(null)}
          onLike={() => repondre(ouvert, "like")}
          onPass={() => repondre(ouvert, "pass")}
        />
      )}

      {/* Confirmation de match */}
      {matchFait && (
        <Link
          href="/matchs"
          className="bg-signature glow-pink fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 font-semibold text-white shadow-lg"
        >
          <HeartHandshake className="h-5 w-5" /> C&apos;est un match ! Voir mes messages
        </Link>
      )}
    </main>
  );
}

function Vignette({ item }: { item: LikeRecu }) {
  const url =
    item.kind === "listing" ? item.listing.photos[0] : item.profile.photo_url;
  const lettre =
    item.kind === "listing"
      ? item.listing.quartier.charAt(0)
      : item.profile.prenom?.charAt(0) || "?";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={url} alt="" className="h-16 w-16 rounded-xl object-cover" />
    );
  }
  return (
    <div className="bg-signature flex h-16 w-16 items-center justify-center rounded-xl font-display text-2xl font-bold text-white">
      {lettre.toUpperCase()}
    </div>
  );
}

function titre(it: LikeRecu): string {
  if (it.kind === "listing")
    return `${it.listing.quartier} · Paris ${it.listing.arrondissement}e`;
  return `${it.profile.prenom}${it.profile.age ? `, ${it.profile.age} ans` : ""}`;
}

function sousTitre(it: LikeRecu): string {
  if (it.kind === "listing") return `${it.listing.loyer} € / mois`;
  return it.profile.profession || "Cherche une coloc";
}
