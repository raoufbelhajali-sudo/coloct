"use client";

import { Analytics } from "@vercel/analytics/react";
import { Capacitor } from "@capacitor/core";

// Vercel Web Analytics : mesure la fréquentation du SITE web (visiteurs,
// pages vues, provenance, pays…) — sans cookies. Désactivé dans l'app native
// pour ne pas mélanger les visites du site et les ouvertures de l'app.
export default function WebAnalytics() {
  if (Capacitor.isNativePlatform()) return null;
  return <Analytics />;
}
