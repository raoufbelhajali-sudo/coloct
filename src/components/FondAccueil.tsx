"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Fond des pages de l'app sur PC : illustration « carte » (maisons corail/bleues)
// posée sur le body (couche de base, fixée au défilement). Les pages de l'app
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
        body.style.backgroundImage = "url(/fond-map.jpg)";
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
