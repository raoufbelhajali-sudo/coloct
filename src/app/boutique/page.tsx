"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Rocket, Check } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import {
  estPremium,
  estBooste,
  activerPassExpress,
  activerBoost,
} from "@/lib/offers";

export default function BoutiquePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [enCours, setEnCours] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  const premium = estPremium(profile);
  const booste = estBooste(profile);

  function dateFr(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }

  async function activer(offre: "pass" | "boost") {
    if (!user) return;
    setEnCours(offre);
    if (offre === "pass") await activerPassExpress(user.id);
    else await activerBoost(user.id);
    await refreshProfile();
    setEnCours(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <AppHeader />

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Booste ta recherche</h1>
        <p className="mt-1 mb-6 text-ink/60">
          Trouve ta coloc plus vite. Pas d&apos;abonnement : tu paies seulement
          quand tu en as besoin.
        </p>

        <div className="space-y-4">
          {/* Pass Express */}
          <OffreCard
            icon={<Zap className="h-6 w-6 text-white" />}
            titre="Pass Express"
            duree="7 jours"
            prix="4,99 €"
            avantages={[
              "Likes illimités",
              "Vois qui t'a déjà liké",
              "Filtres avancés",
            ]}
            actif={premium}
            actifTexte={`Actif jusqu'au ${dateFr(profile?.premium_until ?? null)}`}
            enCours={enCours === "pass"}
            onActiver={() => activer("pass")}
          />

          {/* Boost */}
          <OffreCard
            icon={<Rocket className="h-6 w-6 text-white" />}
            titre="Boost"
            duree="48 heures"
            prix="2,99 €"
            avantages={[
              "Ton profil passe en tête",
              "Vu par bien plus de monde",
              "Plus de matchs, plus vite",
            ]}
            actif={booste}
            actifTexte={`Actif jusqu'au ${dateFr(profile?.boosted_until ?? null)}`}
            enCours={enCours === "boost"}
            onActiver={() => activer("boost")}
          />
        </div>

        <p className="mt-6 text-center text-xs text-ink/40">
          🔒 Paiement sécurisé à venir — pour l&apos;instant, activation de démo
          gratuite pour tester.
        </p>
      </div>
    </main>
  );
}

function OffreCard({
  icon,
  titre,
  duree,
  prix,
  avantages,
  actif,
  actifTexte,
  enCours,
  onActiver,
}: {
  icon: React.ReactNode;
  titre: string;
  duree: string;
  prix: string;
  avantages: string[];
  actif: boolean;
  actifTexte: string;
  enCours: boolean;
  onActiver: () => void;
}) {
  return (
    <div className="rounded-3xl bg-panel p-5">
      <div className="flex items-center gap-3">
        <div className="bg-signature flex h-11 w-11 items-center justify-center rounded-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-display text-xl font-semibold">{titre}</p>
          <p className="text-sm text-ink/50">{duree}</p>
        </div>
        <p className="text-signature font-display text-2xl font-bold">{prix}</p>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
        {avantages.map((a) => (
          <li key={a} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-pink" strokeWidth={3} />
            {a}
          </li>
        ))}
      </ul>

      {actif ? (
        <div className="mt-4 rounded-full bg-panel-2 px-6 py-3 text-center text-sm font-semibold text-pink">
          ✓ {actifTexte}
        </div>
      ) : (
        <button
          onClick={onActiver}
          disabled={enCours}
          className="bg-signature mt-4 w-full rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {enCours ? "Activation…" : `Activer (démo)`}
        </button>
      )}
    </div>
  );
}
