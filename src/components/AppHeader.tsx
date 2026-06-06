"use client";

import Link from "next/link";
import { MessageSquare, UserRound, Zap, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMessagesNonLus, useLikesRecus } from "@/lib/notifications";
import { LogoMark } from "@/components/Logo";
import RolePin from "@/components/RolePin";

// Style commun des boutons-icônes du menu (ronds, survol rose)
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-pink";

// Boutons-icônes charbon mat métallisé
const iconBtnCharbon =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/90 shadow-sm transition-transform hover:scale-105";
const charbon = { backgroundImage: "linear-gradient(135deg, #4a4a4f, #232328)" };

// Pastille de notification : noire et vibrante
const badge =
  "animate-vibrate absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white";

// En-tête commun aux pages connectées : logo + liens (déconnexion = dans Paramètres)
export default function AppHeader({ compact = false }: { compact?: boolean }) {
  const { user, profile } = useAuth();
  const { count: nbMessages, alerte: alerteMsg } = useMessagesNonLus();
  const nbLikes = useLikesRecus();

  // Le logo ramène à l'accueil DANS l'app (selon le rôle), pas à la page publique
  const accueil = !user
    ? "/"
    : profile?.role === "locataire"
      ? "/locataire"
      : "/swipe";

  const estLoca = profile?.role === "locataire";

  return (
    <>
      {/* Bandeau d'alerte quand un nouveau message arrive */}
      {alerteMsg && (
        <Link
          href="/matchs"
          className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <MessageSquare className="h-4 w-4" /> {alerteMsg}
        </Link>
      )}
      <header
        className={
          "flex w-full max-w-sm items-center justify-between " +
          (compact ? "mb-2" : "mb-6")
        }
      >
      <Link href={accueil} className="flex items-center gap-2">
        <LogoMark className="h-7 w-7" />
        <RolePin />
      </Link>

      <nav className="flex items-center gap-1.5">
        {user && (
          <Link
            href="/jaime"
            aria-label={estLoca ? "Candidats intéressés" : "Intéressés par toi"}
            title={estLoca ? "Candidats intéressés" : "Intéressés par toi"}
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
            className={iconBtnCharbon + " relative"}
            style={charbon}
          >
            <MessageSquare className="h-[18px] w-[18px]" />
            {nbMessages > 0 && (
              <span className={badge}>{nbMessages > 9 ? "9+" : nbMessages}</span>
            )}
          </Link>
        )}
        {user && (
          <Link
            href="/boutique"
            aria-label="Boutique"
            title="Boutique"
            className={iconBtnCharbon}
            style={charbon}
          >
            <Zap className="h-[18px] w-[18px]" />
          </Link>
        )}
        {user && (
          <Link
            href="/profil"
            aria-label="Profil"
            title="Profil"
            className={iconBtnCharbon}
            style={charbon}
          >
            <UserRound className="h-[18px] w-[18px]" />
          </Link>
        )}
        {user && (
          <Link
            href="/parametres"
            aria-label="Paramètres"
            title="Paramètres"
            className={iconBtnCharbon}
            style={charbon}
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        )}
      </nav>
      </header>
    </>
  );
}
