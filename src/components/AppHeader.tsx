"use client";

import Link from "next/link";
import { MessageSquare, Zap, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMessagesNonLus, useLikesRecus } from "@/lib/notifications";
import { LogoMark } from "@/components/Logo";
import RolePin from "@/components/RolePin";

// Bleu pastel pour l'icône Boutique
const BLEU_PASTEL = "#74c0fc";

// Style d'un bouton de la barre du bas
const navItem =
  "relative flex h-14 w-14 items-center justify-center transition-transform active:scale-90";

// Pastille de notification : noire et vibrante
const badge =
  "animate-vibrate absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white";

// En-tête : logo + rôle en haut, icônes de navigation dans une barre fixe en bas
export default function AppHeader({
  compact = false,
  hideTop = false,
}: {
  compact?: boolean;
  hideTop?: boolean;
}) {
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

      {/* Haut : pastille de rôle uniquement (le logo est passé en bas) */}
      {!hideTop && (
        <header
          className={
            "flex w-full max-w-sm items-center justify-between " +
            (compact ? "mb-2" : "mb-6")
          }
        >
          <RolePin />
        </header>
      )}

      {/* Bas : barre de navigation fixe (icônes pleines) */}
      {user && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-panel/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-sm items-center justify-around px-2">
            <Link
              href="/jaime"
              aria-label={estLoca ? "Candidats intéressés" : "Intéressés par toi"}
              title={estLoca ? "Candidats intéressés" : "Intéressés par toi"}
              className={navItem}
            >
              <Sparkles className="h-6 w-6 text-black" fill="currentColor" />
              {nbLikes > 0 && (
                <span className={badge}>{nbLikes > 9 ? "9+" : nbLikes}</span>
              )}
            </Link>

            <Link
              href="/matchs"
              aria-label="Messages"
              title="Messages"
              className={navItem}
            >
              <MessageSquare className="h-6 w-6 text-black" fill="currentColor" />
              {nbMessages > 0 && (
                <span className={badge}>{nbMessages > 9 ? "9+" : nbMessages}</span>
              )}
            </Link>

            {/* Clé (logo) au centre : ramène à l'accueil */}
            <Link
              href={accueil}
              aria-label="Accueil"
              title="Accueil"
              className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-bg bg-panel shadow-lg transition-transform active:scale-90"
            >
              <LogoMark className="h-8 w-8" />
            </Link>

            <Link
              href="/boutique"
              aria-label="Boutique"
              title="Boutique"
              className={navItem}
            >
              <Zap
                className="h-6 w-6"
                style={{ color: BLEU_PASTEL }}
                fill={BLEU_PASTEL}
              />
            </Link>

            <Link
              href="/parametres"
              aria-label="Paramètres"
              title="Paramètres"
              className={navItem}
            >
              <Settings className="h-6 w-6 text-black" fill="currentColor" />
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
