"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, MessageSquare } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import InteressesListe from "@/components/InteressesListe";
import MessagerieListe from "@/components/MessagerieListe";
import { useAuth } from "@/lib/auth";
import { useLikesRecus, useMessagesNonLus } from "@/lib/notifications";

type Onglet = "interesses" | "messagerie";

function NotifsContenu() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading } = useAuth();
  const nbLikes = useLikesRecus();
  const { count: nbMessages } = useMessagesNonLus();

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

      {onglet === "interesses" ? (
        <InteressesListe titreVisible={false} />
      ) : (
        <MessagerieListe titreVisible={false} />
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
