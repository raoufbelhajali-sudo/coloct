import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flatswiper.app",
  appName: "FlatSwiper",
  // Dossier web (non utilisé directement ici car on charge le site en ligne,
  // mais Capacitor exige qu'il existe).
  webDir: "public",
  // L'app native charge directement le site déployé.
  server: {
    url: "https://flatswiper.com",
    cleartext: false,
  },
  ios: {
    backgroundColor: "#fff1ea",
  },
};

export default config;
