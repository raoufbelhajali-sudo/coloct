import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

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
  title: "Colock't — Trouve ta coloc à Paris",
  description:
    "Swipe les colocations parisiennes disponibles et entre en contact quand il y a un match.",
  appleWebApp: {
    capable: true,
    title: "Colock't",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
