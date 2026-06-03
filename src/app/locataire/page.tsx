"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LocatairePage() {
  const { profile, loading, signOut } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <header className="mb-8 flex w-full max-w-md items-center justify-between">
        <Link href="/" className="font-display text-2xl font-semibold">
          <span className="text-signature">Colock&apos;t</span>
        </Link>
        <button onClick={signOut} className="text-sm text-ink/60 hover:text-ink">
          Se déconnecter
        </button>
      </header>

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">
          Espace locataire {!loading && profile ? `· ${profile.prenom}` : ""}
        </h1>
        <p className="mt-2 text-ink/70">
          Ici tu pourras bientôt décrire ton bien et swiper sur les profils de
          colocataires intéressés. 🏠
        </p>

        <div className="mt-6 rounded-2xl bg-panel p-5 text-sm text-ink/60">
          🚧 Cette partie (créer son annonce + swiper sur les chercheurs) arrive à
          la prochaine étape.
        </div>
      </div>
    </main>
  );
}
