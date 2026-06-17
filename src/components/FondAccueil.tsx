"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Image d'ambiance en fond, très transparente, sur TOUT le site web.
// Désactivée dans l'app iPhone (native).
export default function FondAccueil() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  if (native) return null; // pas d'illustration dans l'app

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
      {/* Illustration de quartier (colocation / immobilier) en bas de l'écran,
          sur toutes les pages web (accueil, swipe, etc.) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 bg-bottom bg-no-repeat opacity-70"
        style={{
          height: "min(46vh, 460px)",
          backgroundImage: "url(/accueil-bg.svg)",
          backgroundSize: "100% auto",
        }}
      />
    </>
  );
}
