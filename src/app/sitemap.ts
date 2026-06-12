import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://flatswiper.com";

const VILLES = [
  "paris",
  "lyon",
  "marseille",
  "toulouse",
  "bordeaux",
  "lille",
  "nantes",
  "strasbourg",
  "montpellier",
  "rennes",
  "nice",
  "grenoble",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, priority: 1 },
    { url: `${BASE}/annonces`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/contact`, lastModified: now, priority: 0.4 },
    ...VILLES.map((v) => ({
      url: `${BASE}/colocation/${v}`,
      lastModified: now,
      priority: 0.8,
    })),
    { url: `${BASE}/mentions-legales`, lastModified: now, priority: 0.3 },
    { url: `${BASE}/confidentialite`, lastModified: now, priority: 0.3 },
    { url: `${BASE}/cgu`, lastModified: now, priority: 0.3 },
  ];
}
