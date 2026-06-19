"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Capacitor } from "@capacitor/core";

// Bandeau de consentement cookies.
// - Cookies NÉCESSAIRES : toujours actifs (connexion, préférences).
// - Cookie de MESURE PUBLICITAIRE (Google Ads) : chargé UNIQUEMENT si l'utilisateur
//   clique « Accepter ». Le choix est mémorisé dans "flatswiper-consent".
export const CONSENT_KEY = "flatswiper-consent"; // "accepte" | "refuse"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Dans l'app native iOS/Android : aucune mesure publicitaire, donc PAS de
    // bandeau cookies (exigence App Store 5.1.2 — pas de tracking sans ATT).
    if (Capacitor.isNativePlatform()) return;
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem(CONSENT_KEY)
    ) {
      setVisible(true);
    }
  }, []);

  function choisir(valeur: "accepte" | "refuse") {
    try {
      localStorage.setItem(CONSENT_KEY, valeur);
      // Prévient le chargeur Google qu'un choix a été fait (sans recharger la page)
      window.dispatchEvent(new Event("flatswiper-consent-change"));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3">
      <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-ink/10 bg-panel p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 shrink-0 text-bleu" />
          <p className="flex-1 text-sm text-ink/80">
            On utilise des cookies <strong>nécessaires</strong> au fonctionnement
            (connexion, préférences). Avec ton accord, on ajoute un cookie de{" "}
            <strong>mesure publicitaire</strong> (Google) pour améliorer nos
            annonces.{" "}
            <Link href="/confidentialite" className="text-pink underline">
              En savoir plus
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => choisir("refuse")}
            className="flex-1 rounded-full border border-ink/15 bg-panel-2 px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/30"
          >
            Refuser
          </button>
          <button
            onClick={() => choisir("accepte")}
            className="bg-metal flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
