import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import MatchPopup from "@/components/MatchPopup";

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

export const metadata: Metadata = {
  title: "FlatSwiper — Trouve ta colocation partout en France",
  description:
    "Swipe les colocations disponibles près de chez toi et entre en contact quand il y a un match.",
  appleWebApp: {
    capable: true,
    title: "FlatSwiper",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fa5252",
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
        <AuthProvider>
          <MatchPopup />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
