import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// ⚠️ À PASSER À `true` LE JOUR DE LA RÉOUVERTURE du site (en même temps que
// SITE_FERME = false dans ComingSoonGate.tsx). Tant que c'est `false`, on
// empêche Google d'indexer la page « Bientôt disponible ».
const SITE_OUVERT = false;

export default function robots(): MetadataRoute.Robots {
  if (!SITE_OUVERT) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://flatswiper.com/sitemap.xml",
  };
}
