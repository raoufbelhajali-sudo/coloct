"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Handshake } from "lucide-react";
import ListingDetail from "@/components/ListingDetail";
import ProfileDetail from "@/components/ProfileDetail";
import { useAuth } from "@/lib/auth";
import { lieuComplet } from "@/lib/listings";
import { getLikesRecus, repondreLike, type LikeRecu } from "@/lib/likes";

// Liste « Intéressés » (par toi / par ton annonce) — réutilisée par /jaime et /notifs.
export default function InteressesListe({ titreVisible = true }: { titreVisible?: boolean }) {
  const { user, profile } = useAuth();

  const [items, setItems] = useState<LikeRecu[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState<LikeRecu | null>(null);
  const [matchFait, setMatchFait] = useState(false);

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
    <>
      <div className="w-full max-w-sm lg:max-w-[38rem]">
        {titreVisible && (
          <>
            <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-bleu" />
              {profile?.role === "locataire"
                ? "Intéressés par ton annonce"
                : "Intéressés par toi"}
            </h1>
            <p className="mb-5 text-ink/60">
              {profile?.role === "locataire"
                ? "Ces co/locataires ont aimé ton annonce. Ouvre leur profil et décide qui pourrait emménager."
                : "Ces annonceurs aimeraient t'avoir en coloc. Découvre leur logement et décide !"}
            </p>
          </>
        )}

        {chargement ? (
          <p className="text-ink/60">Chargement…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-panel p-6 text-center text-ink/70">
            <Sparkles className="h-10 w-10 text-bleu" />
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
          href="/notifs?tab=messagerie"
          className="bg-metal glow-pink fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 font-semibold text-white shadow-lg"
        >
          <Handshake className="h-5 w-5" /> C&apos;est un match ! Voir mes messages
        </Link>
      )}
    </>
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
  if (it.kind === "listing") return it.listing.titre || lieuComplet(it.listing);
  return `${it.profile.prenom}${it.profile.age ? `, ${it.profile.age} ans` : ""}`;
}

function sousTitre(it: LikeRecu): string {
  if (it.kind === "listing") return `${it.listing.loyer} € / mois`;
  return it.profile.profession || "Cherche une coloc";
}
