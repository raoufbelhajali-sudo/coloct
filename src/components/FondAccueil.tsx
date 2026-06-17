"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Fond d'écran de marque (bleu → turquoise de l'appli) sur le web.
// Désactivé dans l'app iPhone (native).
export default function FondAccueil() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  if (native) return null; // pas de fond custom dans l'app

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20"
      style={{
        background:
          "linear-gradient(160deg, #2563eb 0%, #14b8a6 100%)",
      }}
    />
  );
}
