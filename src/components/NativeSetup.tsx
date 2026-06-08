"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Réglages natifs au démarrage (iPhone uniquement) :
// - la zone web NE passe PLUS sous la barre d'état (heure/réseau/batterie)
// - texte de la barre d'état foncé (fond clair)
export default function NativeSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        // Bande blanche + texte foncé (sinon la bande est noire par défaut)
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Light });
      } catch {
        /* plugin indisponible : on ignore */
      }
    })();
  }, []);
  return null;
}
