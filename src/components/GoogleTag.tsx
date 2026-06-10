"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { CONSENT_KEY } from "@/components/CookieBanner";

// Balise Google Ads (mesure des conversions / remarketing).
// Chargée UNIQUEMENT : sur le web (pas dans l'app native) ET si l'utilisateur
// a cliqué « Accepter » dans le bandeau cookies → conforme RGPD.
const GOOGLE_ADS_ID = "AW-18229778963";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let dejaChargee = false;

function chargerGtag() {
  if (dejaChargee || typeof window === "undefined") return;
  dejaChargee = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

export default function GoogleTag() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return; // jamais dans l'app
    const verifier = () => {
      if (localStorage.getItem(CONSENT_KEY) === "accepte") chargerGtag();
    };
    verifier(); // au cas où le consentement a déjà été donné
    window.addEventListener("flatswiper-consent-change", verifier);
    return () =>
      window.removeEventListener("flatswiper-consent-change", verifier);
  }, []);

  return null;
}
