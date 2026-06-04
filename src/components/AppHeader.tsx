"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, UserRound, LogOut, Zap, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNonLus } from "@/lib/notifications";
import Logo from "@/components/Logo";

// Style commun des boutons-icônes du menu (ronds, survol rose)
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-pink";

// En-tête commun aux pages connectées : logo + liens + déconnexion
export default function AppHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const nonLus = useNonLus();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="mb-6 flex w-full max-w-sm items-center justify-between">
      <Link href="/">
        <Logo markClass="h-7 w-7" textClass="text-xl" />
      </Link>
      <nav className="flex items-center gap-1.5">
        {user && (
          <Link
            href="/matchs"
            aria-label="Matchs"
            title="Matchs"
            className={iconBtn + " relative"}
          >
            <Heart className="h-[18px] w-[18px]" />
            {nonLus > 0 && (
              <span className="bg-signature absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white">
                {nonLus > 9 ? "9+" : nonLus}
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
        {user && (
          <button
            onClick={handleSignOut}
            aria-label="Déconnexion"
            title="Déconnexion"
            className={iconBtn}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        )}
      </nav>
    </header>
  );
}
