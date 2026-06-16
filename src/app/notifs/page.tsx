"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, MessageSquare, Lock } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import InteressesListe from "@/components/InteressesListe";
import MessagerieListe from "@/components/MessagerieListe";
import { useAuth } from "@/lib/auth";
import { estPremium, estHero } from "@/lib/offers";
import { useLikesRecus, useMessagesNonLus } from "@/lib/notifications";

type Onglet = "interesses" | "messagerie";

function NotifsContenu() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, profile, loading } = useAuth();
  const nbLikes = useLikesRecus();
  const { count: nbMessages } = useMessagesNonLus();
  // Notifs (messagerie + qui t'a liké) débloquées par le Pack Swiper ou HeroSwiper
  const debloque = estPremium(profile) || estHero(profile);

  const [onglet, setOnglet] = useState<Onglet>(
    sp.get("tab") === "messagerie" ? "messagerie" : "interesses"
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  const labelInteresses = "Intéressés";

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-5">
      <AppHeader />

      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold mb-4">Notifs</h1>

        {/* Deux onglets horizontaux : Intéressés / Messagerie */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-panel p-1.5">
          <OngletBtn
            actif={onglet === "interesses"}
            onClick={() => setOnglet("interesses")}
            Icon={Sparkles}
            label={labelInteresses}
            count={nbLikes}
          />
          <OngletBtn
            actif={onglet === "messagerie"}
            onClick={() => setOnglet("messagerie")}
            Icon={MessageSquare}
            label="Messagerie"
            count={nbMessages}
          />
        </div>
      </div>

      {debloque ? (
        onglet === "interesses" ? (
          <InteressesListe titreVisible={false} />
        ) : (
          <MessagerieListe titreVisible={false} />
        )
      ) : (
        <div className="w-full max-w-sm">
          <div className="bg-panel-2 flex flex-col items-center gap-3 rounded-3xl p-7 text-center">
            <span className="bg-signature flex h-14 w-14 items-center justify-center rounded-full text-white">
              <Lock className="h-7 w-7" />
            </span>
            <p className="font-display text-xl font-bold">Débloque tes notifs</p>
            <p className="max-w-xs text-sm text-ink/70">
              Vois <strong>qui t&apos;a liké</strong> et accède à la{" "}
              <strong>messagerie</strong> avec le Pack Swiper.
            </p>
            <button
              onClick={() => router.push("/boutique")}
              className="bg-signature mt-1 rounded-full px-6 py-3 font-semibold text-white"
            >
              Pack Swiper — 2,99 €/sem
            </button>
            <p className="text-xs text-ink/40">
              Paiement à venir — déblocage de démo.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function OngletBtn({
  actif,
  onClick,
  Icon,
  label,
  count,
}: {
  actif: boolean;
  onClick: () => void;
  Icon: typeof Sparkles;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors " +
        (actif ? "bg-signature text-white shadow-sm" : "text-ink/60 hover:text-ink")
      }
    >
      <Icon className="h-4 w-4" fill={actif ? "currentColor" : "none"} />
      {label}
      {!!count && count > 0 && (
        <span
          className={
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold " +
            (actif ? "bg-white/25 text-white" : "bg-black text-white")
          }
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

export default function NotifsPage() {
  return (
    <Suspense fallback={<p className="mt-20 text-center text-ink/50">Chargement…</p>}>
      <NotifsContenu />
    </Suspense>
  );
}
