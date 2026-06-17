"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { completudeProfil } from "@/lib/completude";

// Petit message d'accueil à l'ouverture du swipe annonceur (1×/session) :
// motive à trouver facilement les meilleurs colocataires.
export default function AccrocheAnnonceur() {
  const { profile, loading } = useAuth();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (loading || !profile) return;
    // Profil incomplet → priorité au rappel "Termine ton profil" (pas de double popup)
    if (completudeProfil(profile) < 100) return;
    if (sessionStorage.getItem("flatswiper-accroche-annonceur") === "1") return;
    const t = setTimeout(() => setOuvert(true), 700);
    return () => clearTimeout(t);
  }, [loading, profile]);

  function fermer() {
    sessionStorage.setItem("flatswiper-accroche-annonceur", "1");
    setOuvert(false);
  }

  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={fermer}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-panel p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-signature mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <Users className="h-7 w-7 text-white" />
        </div>

        <h2 className="font-display text-2xl font-semibold leading-tight">
          Trouve facilement tes meilleurs co/locataires&nbsp;!
        </h2>
        <p className="mt-2 text-ink/70">
          Swipe les profils&nbsp;: <span className="font-medium text-pink">à droite</span>{" "}
          si ça t&apos;intéresse, à gauche pour passer. Quand c&apos;est
          réciproque, c&apos;est un <span className="font-medium text-pink">match</span>{" "}
          et la discussion s&apos;ouvre.
        </p>
        <p className="mt-3 text-sm text-ink/55">
          💡 Un profil complet et une annonce <strong>boostée</strong> attirent les
          meilleurs candidats.
        </p>

        <button
          onClick={fermer}
          className="bg-signature mt-5 w-full rounded-full px-4 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          C&apos;est parti !
        </button>
        <Link
          href="/mon-annonce"
          onClick={fermer}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-violet hover:underline"
        >
          <Rocket className="h-4 w-4" /> Booster mon annonce
        </Link>
      </div>
    </div>
  );
}
