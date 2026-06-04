"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, UserRound, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

// En-tête commun aux pages connectées : logo + liens + déconnexion
export default function AppHeader({
  showPreferences = false,
}: {
  showPreferences?: boolean;
}) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="mb-6 flex w-full max-w-sm items-center justify-between">
      <Link href="/">
        <Logo markClass="h-7 w-7" textClass="text-xl" />
      </Link>
      <nav className="flex items-center gap-4 text-sm text-ink/60">
        {user && (
          <Link href="/matchs" className="flex items-center gap-1.5 hover:text-ink">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Matchs</span>
          </Link>
        )}
        {user && (
          <Link href="/boutique" className="flex items-center gap-1.5 hover:text-ink">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Boutique</span>
          </Link>
        )}
        {showPreferences && (
          <Link href="/profil" className="flex items-center gap-1.5 hover:text-ink">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </Link>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        )}
      </nav>
    </header>
  );
}
