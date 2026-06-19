"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Fond des pages de l'app sur PC : dégradé bleu → turquoise posé sur le body
// (couche de base). Les pages de l'app ont un <main> transparent → le dégradé
// apparaît autour du contenu centré. Les pages publiques (accueil, blog…) ont
// un fond blanc opaque → elles restent blanches. Rien sur mobile web ni app
// native.
export default function FondAccueil() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (Capacitor.isNativePlatform()) return; // pas dans l'app native
    const mqPc = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const body = document.body;
    function appliquer() {
      if (mqPc.matches) {
        body.style.backgroundImage =
          "linear-gradient(135deg, #2563eb, #14b8a6)";
        body.style.backgroundAttachment = "fixed";
      } else {
        body.style.backgroundImage = "";
        body.style.backgroundAttachment = "";
      }
    }
    appliquer();
    mqPc.addEventListener("change", appliquer);
    return () => {
      mqPc.removeEventListener("change", appliquer);
      body.style.backgroundImage = "";
      body.style.backgroundAttachment = "";
    };
  }, []);

  return null;
}
