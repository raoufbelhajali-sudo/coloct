import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import MatchPopup from "@/components/MatchPopup";
import CookieBanner from "@/components/CookieBanner";
import ComingSoonGate from "@/components/ComingSoonGate";
import NativeSetup from "@/components/NativeSetup";
import FondAccueil from "@/components/FondAccueil";
import WebAnalytics from "@/components/WebAnalytics";

// Police des titres et du logo (serif chic)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// Police du texte courant (sans-serif moderne)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://flatswiper.com";
const TITRE = "FlatSwiper — Trouve ta colocation en swipant";
const DESCRIPTION =
  "Swipe les colocations près de chez toi, matche, et discute pour organiser ta visite. 100% gratuit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITRE,
  description: DESCRIPTION,
  appleWebApp: {
    capable: true,
    title: "FlatSwiper",
    statusBarStyle: "default",
  },
  // Aperçu quand on partage le lien (Facebook, Instagram, WhatsApp, iMessage…)
  openGraph: {
    type: "website",
    siteName: "FlatSwiper",
    title: TITRE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "fr_FR",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FlatSwiper — trouve ta colocation en swipant",
      },
    ],
  },
  // Aperçu sur X / Twitter
  twitter: {
    card: "summary_large_image",
    title: TITRE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fa5252",
  // Permet à l'app d'occuper tout l'écran et d'activer les zones de sécurité
  // (env(safe-area-inset-*)) → s'adapte à tous les iPhone (encoche, Dynamic Island…)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NativeSetup />
        <FondAccueil />
        <ComingSoonGate>
          <AuthProvider>
            <MatchPopup />
            {children}
            <CookieBanner />
          </AuthProvider>
        </ComingSoonGate>
        <WebAnalytics />
      </body>
    </html>
  );
}
