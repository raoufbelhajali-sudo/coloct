"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { completudeProfil } from "@/lib/completude";

// Pop-up de rappel : si le profil n'est pas complété à 100 %, on invite
// gentiment l'utilisateur à le finaliser (une fois par session).
export default function RappelProfil() {
  const { profile, loading } = useAuth();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (loading || !profile) return;
    if (completudeProfil(profile) >= 100) return;
    if (sessionStorage.getItem("colockt-rappel-profil") === "1") return;
    // petit délai pour laisser la page s'afficher d'abord
    const t = setTimeout(() => setOuvert(true), 800);
    return () => clearTimeout(t);
  }, [loading, profile]);

  function fermer() {
    sessionStorage.setItem("colockt-rappel-profil", "1");
    setOuvert(false);
  }

  if (!ouvert || !profile) return null;
  const pct = completudeProfil(profile);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={fermer}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-panel p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={fermer}
          aria-label="Fermer"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-panel-2 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-signature mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <Sparkles className="h-7 w-7 text-white" />
        </div>

        <h2 className="font-display text-2xl font-semibold">
          Termine ton profil&nbsp;!
        </h2>
        <p className="mt-2 text-ink/70">
          Ton profil est rempli à <span className="font-semibold text-pink">{pct}%</span>.
          N&apos;oublie pas de le finaliser : un profil complet, c&apos;est
          beaucoup plus de chances de faire un match&nbsp;!
        </p>

        {/* Barre de progression */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-panel-2">
          <div
            className="bg-signature h-full rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <Link
          href="/profil"
          onClick={fermer}
          className="bg-signature mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Compléter mon profil
        </Link>
        <button
          onClick={fermer}
          className="mt-2 w-full rounded-full px-4 py-2 text-sm text-ink/50 hover:text-ink"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
