"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Rocket, Check, Lock, MessageSquare } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import {
  estPremium,
  estBooste,
  activerPassExpress,
  activerBoost,
  activerBoostAnnonceur,
  activerMessagesDirects,
} from "@/lib/offers";
import { getMyListing } from "@/lib/locataire";
import type { Listing } from "@/data/listings";
import InviterAmis from "@/components/InviterAmis";

// Un dégradé différent par forfait
const GRAD_PASS = "linear-gradient(135deg,#fa5252,#fd7e14)"; // rose → violet
const GRAD_BOOST = "linear-gradient(135deg,#f59e0b,#ec4899)"; // orange → rose
const GRAD_MESSAGES = "linear-gradient(135deg,#3b82f6,#06b6d4)"; // bleu → cyan
const GRAD_ANNONCE = "linear-gradient(135deg,#10b981,#06b6d4)"; // vert → cyan

export default function BoutiquePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [enCours, setEnCours] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  const estAnnonceur = profile?.role === "locataire";

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  const chargerAnnonce = useCallback(async () => {
    if (!user || !estAnnonceur) return;
    setListing(await getMyListing(user.id));
  }, [user, estAnnonceur]);

  useEffect(() => {
    chargerAnnonce();
  }, [chargerAnnonce]);

  const premium = estPremium(profile);
  const booste = estBooste(profile);

  function dateFr(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }

  async function activer(offre: "pass" | "boost" | "annonceur" | "messages") {
    if (!user) return;
    setEnCours(offre);
    if (offre === "pass") await activerPassExpress(user.id);
    else if (offre === "boost") await activerBoost(user.id);
    else if (offre === "messages") await activerMessagesDirects(user.id);
    else if (offre === "annonceur" && listing)
      await activerBoostAnnonceur(user.id, listing.id);
    await refreshProfile();
    await chargerAnnonce();
    setEnCours(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <AppHeader />

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">
          {estAnnonceur ? "Booste ton annonce" : "Booste ta recherche"}
        </h1>
        <p className="mt-1 mb-6 text-ink/60">
          {estAnnonceur
            ? "Trouve le bon coloc plus vite. Pas d'abonnement : tu paies seulement quand tu en as besoin."
            : "Trouve ta coloc plus vite. Pas d'abonnement : tu paies seulement quand tu en as besoin."}
        </p>

        <div className="space-y-4">
          {estAnnonceur ? (
            // ----- Annonceur : un seul bloc -----
            !listing ? (
              <div className="rounded-3xl bg-panel p-6 text-center text-ink/70">
                <Rocket className="mx-auto h-10 w-10 text-pink" />
                <p className="mt-3">
                  Publie d&apos;abord ton annonce pour pouvoir la booster.
                </p>
                <Link
                  href="/locataire"
                  className="bg-signature mt-4 inline-block rounded-full px-6 py-3 font-semibold text-white"
                >
                  Créer mon annonce
                </Link>
              </div>
            ) : (
              <OffreCard
                icon={<Rocket className="h-6 w-6 text-white" />}
                titre="Boost ton annonce"
                duree="7 jours"
                prix="5 €"
                avantages={[
                  "Ton appartement mis en avant",
                  "Accède aux meilleurs profils",
                  "Classés par poste occupé + compatibilité avec ton profil",
                ]}
                actif={premium}
                actifTexte={`Actif jusqu'au ${dateFr(profile?.premium_until ?? null)}`}
                enCours={enCours === "annonceur"}
                onActiver={() => activer("annonceur")}
                grad={GRAD_ANNONCE}
              />
            )
          ) : (
            // ----- Colocataire : Pass Express + Boost -----
            <>
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
                grad={GRAD_PASS}
              />
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
                grad={GRAD_BOOST}
              />

              {/* Messages directs (crédits) */}
              <div className="rounded-3xl bg-panel p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundImage: GRAD_MESSAGES }}
                  >
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-xl font-semibold">
                      Messages directs
                    </p>
                    <p className="text-sm text-ink/50">5 messages</p>
                  </div>
                  <p
                    className="font-display text-2xl font-bold"
                    style={{
                      backgroundImage: GRAD_MESSAGES,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    3,99 €
                  </p>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink" strokeWidth={3} />
                    Contacte un annonceur sans attendre un match
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink" strokeWidth={3} />
                    Va droit au but pour les annonces qui te plaisent
                  </li>
                </ul>
                <p className="mt-3 text-sm text-ink/60">
                  Tu as{" "}
                  <span className="font-semibold text-pink">
                    {profile?.credits_messages ?? 0}
                  </span>{" "}
                  crédit{(profile?.credits_messages ?? 0) > 1 ? "s" : ""} de
                  message direct.
                </p>
                <button
                  onClick={() => activer("messages")}
                  disabled={enCours === "messages"}
                  className="mt-3 w-full rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                  style={{ backgroundImage: GRAD_MESSAGES }}
                >
                  {enCours === "messages" ? "Activation…" : "+5 messages (démo)"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Parrainage : gratuit */}
        <div className="mt-4 rounded-3xl bg-panel p-5">
          <p className="font-display text-lg font-semibold">Inviter des amis</p>
          <p className="mt-1 mb-3 text-sm text-ink/60">
            Partage Colock&apos;t et gagne des swipes gratuits.
          </p>
          <InviterAmis />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ink/40">
          <Lock className="h-3.5 w-3.5" />
          Paiement sécurisé à venir — activation de démo gratuite pour tester.
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
  grad = GRAD_PASS,
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
  grad?: string;
}) {
  return (
    <div className="rounded-3xl bg-panel p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundImage: grad }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-display text-xl font-semibold">{titre}</p>
          <p className="text-sm text-ink/50">{duree}</p>
        </div>
        <p
          className="font-display text-2xl font-bold"
          style={{
            backgroundImage: grad,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {prix}
        </p>
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
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-panel-2 px-6 py-3 text-sm font-semibold text-pink">
          <Check className="h-4 w-4" strokeWidth={3} /> {actifTexte}
        </div>
      ) : (
        <button
          onClick={onActiver}
          disabled={enCours}
          className="mt-4 w-full rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          style={{ backgroundImage: grad }}
        >
          {enCours ? "Activation…" : `Activer (démo)`}
        </button>
      )}
    </div>
  );
}
