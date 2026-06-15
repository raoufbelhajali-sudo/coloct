"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { MessageSquare, Zap, Settings, Sparkles, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMessagesNonLus, useLikesRecus } from "@/lib/notifications";

// Pastille de notification : noire et vibrante
const badge =
  "animate-vibrate absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white";

// En-tête : pastille de rôle en haut, barre de navigation fixe en bas.
export default function AppHeader({
  hideTop = false,
}: {
  hideTop?: boolean;
}) {
  const { user, profile } = useAuth();
  const { count: nbMessages, alerte: alerteMsg } = useMessagesNonLus();
  const nbLikes = useLikesRecus();
  const pathname = usePathname();

  // Bouton "Accueil" (revoir le site d'annonces) → web PC uniquement
  const [estNatif, setEstNatif] = useState(false);
  useEffect(() => {
    setEstNatif(Capacitor.isNativePlatform());
  }, []);

  // Le logo ramène à l'accueil DANS l'app (selon le rôle)
  const accueil = !user
    ? "/"
    : profile?.role === "locataire"
      ? "/locataire"
      : "/swipe";

  const estLoca = profile?.role === "locataire";
  const accueilActif =
    pathname === "/" || pathname === "/swipe" || pathname === "/locataire";

  // Un item de navigation (icône + libellé). Actif → corail + icône pleine.
  function NavItem({
    href,
    label,
    Icon,
    actif,
    count,
  }: {
    href: string;
    label: string;
    Icon: typeof Sparkles;
    actif: boolean;
    count?: number;
  }) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={
          "flex flex-1 flex-col items-center gap-1 py-2 transition-transform active:scale-90 " +
          (actif ? "text-bleu" : "text-ink/40 hover:text-ink/70")
        }
      >
        <span className="relative">
          <Icon
            className="h-[22px] w-[22px] transition-colors"
            fill={actif ? "currentColor" : "none"}
            strokeWidth={actif ? 1.5 : 2}
          />
          {!!count && count > 0 && (
            <span className={badge}>{count > 9 ? "9+" : count}</span>
          )}
        </span>
        <span className="text-[10px] font-medium leading-none">{label}</span>
      </Link>
    );
  }

  return (
    <>
      {/* Bandeau d'alerte quand un nouveau message arrive */}
      {alerteMsg && (
        <Link
          href="/matchs"
          className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <MessageSquare className="h-4 w-4" /> {alerteMsg}
        </Link>
      )}

      {/* Bouton "Accueil" (revoir le site d'annonces) — web PC uniquement,
          flottant en haut à droite, présent sur TOUTES les pages (dont le swipe). */}
      {user && !estNatif && (
        <Link
          href="/"
          title="Voir le site (mode annonces)"
          className="fixed right-4 top-4 z-50 hidden items-center gap-1.5 rounded-full bg-panel/95 px-3.5 py-2 text-xs font-semibold text-ink/70 shadow-sm ring-1 ring-ink/10 backdrop-blur transition-colors hover:text-ink lg:flex"
        >
          <Home className="h-4 w-4" /> Accueil
        </Link>
      )}

      {/* Haut : logo centré */}
      {!hideTop && (
        <header className="mb-4 flex h-9 w-full max-w-md items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="FlatSwiper" className="h-6 w-auto" />
        </header>
      )}

      {/* Bas : barre de navigation fixe */}
      {user && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-panel/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-sm items-end justify-around px-2">
            <NavItem
              href="/jaime"
              label={estLoca ? "Candidats" : "J'aime"}
              Icon={Sparkles}
              actif={pathname === "/jaime"}
              count={nbLikes}
            />
            <NavItem
              href="/matchs"
              label="Messages"
              Icon={MessageSquare}
              actif={pathname.startsWith("/matchs")}
              count={nbMessages}
            />

            {/* Bouton central : le swipe (sans texte, dans le footer) */}
            <Link
              href={accueil}
              aria-label="Swipe"
              title="Swipe"
              className="flex flex-1 flex-col items-center justify-center py-2"
            >
              <span
                className={
                  "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-transform active:scale-90 " +
                  (accueilActif ? "ring-2 ring-bleu" : "ring-1 ring-ink/10")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-symbol.png"
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </span>
            </Link>

            <NavItem
              href="/boutique"
              label="Boutique"
              Icon={Zap}
              actif={pathname.startsWith("/boutique")}
            />
            <NavItem
              href="/parametres"
              label="Réglages"
              Icon={Settings}
              actif={pathname.startsWith("/parametres")}
            />
          </div>
        </nav>
      )}
    </>
  );
}
