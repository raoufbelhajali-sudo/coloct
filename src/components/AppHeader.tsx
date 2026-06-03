"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
          <Link href="/matchs" className="hover:text-ink">
            Matchs
          </Link>
        )}
        {showPreferences && (
          <Link href="/profil" className="hover:text-ink">
            Préférences
          </Link>
        )}
        {user && (
          <button onClick={handleSignOut} className="hover:text-ink">
            Déconnexion
          </button>
        )}
      </nav>
    </header>
  );
}
