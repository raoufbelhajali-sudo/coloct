"use client";

import Link from "next/link";
import { Heart, UserRound, Zap, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNbMatchs, useLikesRecus } from "@/lib/notifications";
import Logo from "@/components/Logo";

// Style commun des boutons-icônes du menu (ronds, survol rose)
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-pink";

// En-tête commun aux pages connectées : logo + liens (déconnexion = dans Paramètres)
export default function AppHeader() {
  const { user, profile } = useAuth();
  const nbMatchs = useNbMatchs();
  const nbLikes = useLikesRecus();

  // Le logo ramène à l'accueil DANS l'app (selon le rôle), pas à la page publique
  const accueil = !user
    ? "/"
    : profile?.role === "locataire"
      ? "/locataire"
      : "/swipe";

  return (
    <header className="mb-6 flex w-full max-w-sm items-center justify-between">
      <Link href={accueil}>
        <Logo markClass="h-7 w-7" textClass="text-xl" />
      </Link>
      <nav className="flex items-center gap-1.5">
        {user && (
          <Link
            href="/jaime"
            aria-label="Qui vous aime"
            title="Qui vous aime"
            className={iconBtn + " relative"}
          >
            <Sparkles className="h-[18px] w-[18px]" />
            {nbLikes > 0 && (
              <span className="bg-signature absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white">
                {nbLikes > 9 ? "9+" : nbLikes}
              </span>
            )}
          </Link>
        )}
        {user && (
          <Link
            href="/matchs"
            aria-label="Matchs"
            title="Matchs"
            className={iconBtn + " relative"}
          >
            <Heart className="h-[18px] w-[18px]" />
            {nbMatchs > 0 && (
              <span className="bg-signature absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white">
                {nbMatchs > 9 ? "9+" : nbMatchs}
              </span>
            )}
          </Link>
        )}
        {user && (
          <Link href="/boutique" aria-label="Boutique" title="Boutique" className={iconBtn}>
            <Zap className="h-[18px] w-[18px]" />
          </Link>
        )}
        {user && (
          <Link href="/profil" aria-label="Profil" title="Profil" className={iconBtn}>
            <UserRound className="h-[18px] w-[18px]" />
          </Link>
        )}
        {user && (
          <Link
            href="/parametres"
            aria-label="Paramètres"
            title="Paramètres"
            className={iconBtn}
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        )}
      </nav>
    </header>
  );
}
