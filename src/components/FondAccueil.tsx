"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Fond des pages de l'app sur PC : photo de colocation (atténuée par un voile
// blanc à 50%) posée sur le body (couche de base, fixée au défilement). Les pages de l'app
// ont un <main> transparent → l'image apparaît autour du contenu centré. Les
// pages publiques (fond opaque) restent blanches. Rien sur mobile web ni app
// native.
export default function FondAccueil() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (Capacitor.isNativePlatform()) return; // pas dans l'app native
    const mqPc = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const body = document.body;
    function appliquer() {
      if (mqPc.matches) {
        // Voile blanc à 70% par-dessus = image atténuée (~30% d'opacité).
        body.style.backgroundImage =
          "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(/fond-coloc.jpg)";
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        body.style.backgroundAttachment = "fixed";
        body.style.backgroundRepeat = "no-repeat";
      } else {
        body.style.backgroundImage = "";
      }
    }
    appliquer();
    mqPc.addEventListener("change", appliquer);
    return () => {
      mqPc.removeEventListener("change", appliquer);
      body.style.backgroundImage = "";
    };
  }, []);

  return null;
}
