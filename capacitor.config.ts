import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flatswiper.app",
  appName: "FlatSwiper",
  // App embarquée : on charge les fichiers générés par "next build" (output: export)
  webDir: "out",
  ios: {
    backgroundColor: "#fff1ea",
  },
};

export default config;
