"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { CONSENT_KEY } from "@/components/CookieBanner";

// Balise Google Ads avec MODE CONSENTEMENT (Consent Mode v2).
// - La balise est toujours présente sur le WEB → Google peut la détecter.
// - Mais TANT QUE l'utilisateur n'a pas cliqué « Accepter », tout est "denied"
//   → aucun cookie publicitaire posé (conforme RGPD / CNIL).
// - Jamais chargée dans l'app native.
const GOOGLE_ADS_ID = "AW-18229778963";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function etatConsentement() {
  const ok =
    typeof window !== "undefined" &&
    localStorage.getItem(CONSENT_KEY) === "accepte";
  const v = ok ? "granted" : "denied";
  return {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  } as const;
}

let dejaInit = false;

function initGtag() {
  if (dejaInit || typeof window === "undefined") return;
  dejaInit = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  // 1) Consentement par défaut (refusé sauf si déjà accepté) AVANT tout
  window.gtag("consent", "default", etatConsentement());
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
  // 2) Chargement du script Google
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(s);
}

export default function GoogleTag() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return; // jamais dans l'app
    initGtag();
    // Quand l'utilisateur fait son choix → on met à jour le consentement
    const onChange = () => window.gtag?.("consent", "update", etatConsentement());
    window.addEventListener("flatswiper-consent-change", onChange);
    return () =>
      window.removeEventListener("flatswiper-consent-change", onChange);
  }, []);

  return null;
}
