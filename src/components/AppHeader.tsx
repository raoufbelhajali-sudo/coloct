"use client";

import Link from "next/link";
import {
  MessageSquare,
  UserRound,
  Zap,
  Settings,
  Sparkles,
  KeyRound,
  Telescope,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMessagesNonLus, useLikesRecus } from "@/lib/notifications";
import { LogoMark } from "@/components/Logo";

// Style commun des boutons-icônes du menu (ronds, survol rose)
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-pink";

// Pastille de notification : noire et vibrante
const badge =
  "animate-vibrate absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white";

// En-tête commun aux pages connectées : logo + liens (déconnexion = dans Paramètres)
export default function AppHeader() {
  const { user, profile } = useAuth();
  const nbMessages = useMessagesNonLus();
  const nbLikes = useLikesRecus();

  // Le logo ramène à l'accueil DANS l'app (selon le rôle), pas à la page publique
  const accueil = !user
    ? "/"
    : profile?.role === "locataire"
      ? "/locataire"
      : "/swipe";

  const estLoca = profile?.role === "locataire";

  return (
    <header className="mb-6 flex w-full max-w-sm items-center justify-between">
      <Link href={accueil} className="flex items-center gap-2">
        <LogoMark className="h-7 w-7" />
        {/* Pin du rôle : Annonceur (locataire) ou Colocataire */}
        {profile && (
          <span className="inline-flex items-center gap-1 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink/70">
            {estLoca ? (
              <KeyRound className="h-3 w-3 text-violet" />
            ) : (
              <Telescope className="h-3 w-3 text-pink" />
            )}
            {estLoca ? "Annonceur" : "Colocataire"}
          </span>
        )}
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
              <span className={badge}>{nbLikes > 9 ? "9+" : nbLikes}</span>
            )}
          </Link>
        )}
        {user && (
          <Link
            href="/matchs"
            aria-label="Messages"
            title="Messages"
            className={iconBtn + " relative"}
          >
            <MessageSquare className="h-[18px] w-[18px]" />
            {nbMessages > 0 && (
              <span className={badge}>{nbMessages > 9 ? "9+" : nbMessages}</span>
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
