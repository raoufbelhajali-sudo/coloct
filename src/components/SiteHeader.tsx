"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Rocket } from "lucide-react";

// Header public commun à toutes les pages du site.
export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const actif = (prefixe: string) => pathname.startsWith(prefixe);
  const lienCls = (on: boolean) =>
    "transition-colors " + (on ? "text-pink" : "hover:text-ink");

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="Accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 md:flex">
          <Link href="/annonces" className={lienCls(actif("/annonce"))}>Annonces</Link>
          <Link href="/colocataires" className={lienCls(actif("/colocataire"))}>Colocataires</Link>
          {/* Blog : ordinateur uniquement (≥ lg) */}
          <Link href="/blog" className={"hidden items-center gap-1.5 lg:flex " + lienCls(actif("/blog"))}>
            <MessageCircle className="h-4 w-4" /> Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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

          {/* Commencez ici — bouton qui "vibre" */}
          <motion.div
            animate={{ rotate: [0, -4, 4, -4, 4, 0], scale: [1, 1.06, 1.06, 1.06, 1.06, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
            className="inline-block"
          >
            <Link href="/connexion" className="bg-signature glow-pink flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white">
              <Rocket className="h-4 w-4" /> Commencez ici
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
