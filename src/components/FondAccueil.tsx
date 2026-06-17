"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/lib/auth";

// Pages "app" qui affichent la barre de navigation du bas (≈ 72 px).
// On y remonte l'illustration pour qu'elle ne soit pas cachée par la barre.
const PAGES_APP = [
  "/swipe", "/notifs", "/profil", "/parametres", "/compte",
  "/boutique", "/mon-annonce", "/locataire", "/jaime", "/matchs",
  "/favoris", "/blog",
];

// Image d'ambiance en fond, transparente, sur TOUT le site web.
// Désactivée dans l'app iPhone (native).
export default function FondAccueil() {
  const [native, setNative] = useState(false);
  const pathname = usePathname() || "/";
  const { user } = useAuth();

  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  if (native) return null; // pas d'illustration dans l'app

  // La barre du bas n'apparaît que pour un utilisateur CONNECTÉ sur une page app.
  const barreEnBas = !!user && PAGES_APP.some((p) => pathname.startsWith(p));

  return (
    <>
      {/* Léger dégradé d'ambiance derrière tout le contenu (web uniquement) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f7fafc 55%, #eef5f3 100%)",
        }}
      />
      {/* Illustration de quartier (colocation / immobilier).
          Sur les pages app, on la remonte au-dessus de la barre du bas pour
          ne pas qu'elle soit coupée. Transparence à 50 %. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 -z-10 bg-bottom bg-no-repeat opacity-50"
        style={{
          bottom: barreEnBas ? "calc(72px + env(safe-area-inset-bottom))" : 0,
          height: "min(46vh, 460px)",
          backgroundImage: "url(/accueil-bg.svg)",
          backgroundSize: "100% auto",
        }}
      />
    </>
  );
}
