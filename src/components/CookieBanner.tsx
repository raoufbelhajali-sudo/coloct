"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

// Bandeau d'information cookies. L'app n'utilise que le strict nécessaire
// (session de connexion, préférences) → simple acquittement, pas de traçage.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("flatswiper-cookies-ok") !== "1"
    ) {
      setVisible(true);
    }
  }, []);

  function accepter() {
    localStorage.setItem("flatswiper-cookies-ok", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3">
      <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-ink/10 bg-panel p-4 shadow-2xl sm:flex-row sm:items-center">
        <Cookie className="h-6 w-6 shrink-0 text-pink" />
        <p className="flex-1 text-sm text-ink/80">
          On utilise uniquement les cookies <strong>nécessaires</strong> au
          fonctionnement (connexion, préférences) — pas de pub ni de traçage.{" "}
          <Link href="/confidentialite" className="text-pink underline">
            En savoir plus
          </Link>
          .
        </p>
        <button
          onClick={accepter}
          className="bg-signature shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
