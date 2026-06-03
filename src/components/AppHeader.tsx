"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, SlidersHorizontal, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

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
      <Link href="/" className="font-display text-2xl font-semibold">
        <span className="text-signature">Colock&apos;t</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-ink/60">
        {user && (
          <Link href="/matchs" className="flex items-center gap-1.5 hover:text-ink">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Matchs</span>
          </Link>
        )}
        {showPreferences && (
          <Link href="/profil" className="flex items-center gap-1.5 hover:text-ink">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Préférences</span>
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
