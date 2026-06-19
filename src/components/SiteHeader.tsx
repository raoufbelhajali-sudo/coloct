"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Rocket, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AideFAQ from "@/components/AideFAQ";

// Header public commun à toutes les pages du site.
export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { user, profile } = useAuth();
  const actif = (prefixe: string) => pathname.startsWith(prefixe);
  const lienCls = (on: boolean) =>
    "transition-colors " + (on ? "text-pink" : "hover:text-ink");
  // Connecté → on ramène directement dans l'app (espace selon le rôle).
  const espaceHref = profile
    ? profile.role === "locataire"
      ? "/locataire"
      : "/swipe"
    : "/bienvenue";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
      <div
        className={
          "mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 " +
          (pathname === "/" ? "justify-between" : "justify-end md:justify-between")
        }
      >
        {/* Logo : uniquement sur la page d'accueil, en haut à gauche */}
        {pathname === "/" && (
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.svg" alt="FlatSwiper" className="h-9 w-auto" />
          </Link>
        )}

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 md:flex">
          <Link href="/" className={"flex items-center gap-1.5 " + lienCls(pathname === "/")}>
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <Link href="/blog" className={"flex items-center gap-1.5 " + lienCls(actif("/blog"))}>
            <MessageCircle className="h-4 w-4" /> Blog
          </Link>
          <AideFAQ label="FAQ" className="flex items-center gap-1.5 transition-colors hover:text-ink" />
        </nav>

        <div className="flex items-center gap-2">
          {/* Blog — icône accessible sur téléphone (le menu est masqué < md) */}
          <Link
            href="/blog"
            aria-label="Blog"
            className={"flex h-9 w-9 items-center justify-center rounded-full bg-panel md:hidden " + (actif("/blog") ? "text-pink" : "text-ink/70")}
          >
            <MessageCircle className="h-4 w-4" />
          </Link>

          {/* FAQ — icône accessible sur téléphone */}
          <AideFAQ label="" className="flex h-9 w-9 items-center justify-center rounded-full bg-panel text-ink/70 md:hidden" />

          {/* Bientôt sur les stores — badge animé */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden items-center gap-2 rounded-full bg-panel px-3.5 py-2 text-xs font-semibold text-ink/70 lg:flex"
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="block h-2 w-2 rounded-full bg-pink"
            />
            Bientôt sur App Store &amp; Google Play
          </motion.span>

          {user ? (
            /* Connecté → retour direct dans l'app */
            <Link href={espaceHref} className="bg-metal glow-pink flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white">
              <Home className="h-4 w-4" /> Mon espace
            </Link>
          ) : (
            /* Commencez ici — bouton qui "vibre" */
            <motion.div
              animate={{ rotate: [0, -4, 4, -4, 4, 0], scale: [1, 1.06, 1.06, 1.06, 1.06, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
              className="inline-block"
            >
              <Link href="/connexion" className="bg-metal glow-pink flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white">
                <Rocket className="h-4 w-4" /> Commencez ici
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
