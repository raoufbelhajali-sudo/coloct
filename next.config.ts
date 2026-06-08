import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App "embarquée" : on génère des fichiers HTML/JS statiques dans /out
  // que Capacitor met directement dans l'app iPhone (plus de chargement du site en ligne).
  output: "export",
  // Chaque route devient un dossier avec index.html (ex: /connexion/index.html).
  // Indispensable pour que l'app embarquée (Capacitor) retrouve les pages.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
