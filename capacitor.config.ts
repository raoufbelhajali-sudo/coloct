import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flatswiper.app",
  appName: "FlatSwiper",
  // App embarquée : on charge les fichiers générés par "next build" (output: export)
  webDir: "out",
  ios: {
    backgroundColor: "#ffffff",
  },
  plugins: {
    StatusBar: {
      // La barre d'état n'empiète pas sur le contenu web…
      overlaysWebView: false,
      // …et sa bande est BLANCHE avec texte foncé (heure/batterie visibles).
      backgroundColor: "#ffffff",
      style: "LIGHT",
    },
  },
};

export default config;
