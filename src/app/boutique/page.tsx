"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Rocket, Check, Lock, Star, Gift } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import {
  estPremium,
  estHero,
  activerPassExpress,
  activerHero,
  activerBoost,
  activerBoostAnnonceur,
  activerMessagesDirects,
} from "@/lib/offers";
import { getMyListing } from "@/lib/locataire";
import type { Listing } from "@/data/listings";
import InviterAmis from "@/components/InviterAmis";

// Un dégradé chaud différent par forfait (harmonisé avec la charte corail/orange)
const GRAD_PASS = "linear-gradient(135deg,#fa5252,#fd7e14)"; // corail → orange
const GRAD_ANNONCE = "linear-gradient(135deg,#e8590c,#fd7e14)"; // orange brûlé → orange
const GRAD_HERO = "linear-gradient(135deg,#4dabf7,#228be6)"; // bleu (HeroSwiper)

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
  const hero = estHero(profile);

  // Offre de lancement : sur le SITE WEB, tout est gratuit pour l'instant
  // (« gratuit aujourd'hui, payant demain »). Dans l'app, on garde le mode normal.
  const [estNatif, setEstNatif] = useState(false);
  useEffect(() => {
    setEstNatif(Capacitor.isNativePlatform());
  }, []);
  const lancement = !estNatif;

  function dateFr(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  }

  async function activer(
    offre: "pass" | "swiper" | "boost" | "annonceur" | "messages"
  ) {
    if (!user) return;
    setEnCours(offre);
    if (offre === "swiper") {
      // Pack Swiper : swipes illimités + filtres avancés
      await activerPassExpress(user.id);
    } else if (offre === "pass") {
      // HeroSwiper (le max) : tous les avantages chercheur
      await activerHero(user.id);
      await activerBoost(user.id);
      await activerMessagesDirects(user.id);
    } else if (offre === "boost") await activerBoost(user.id);
    else if (offre === "messages") await activerMessagesDirects(user.id);
    else if (offre === "annonceur" && listing)
      await activerBoostAnnonceur(user.id, listing.id);
    await refreshProfile();
    await chargerAnnonce();
    setEnCours(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-5">
      <AppHeader />

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">
          {estAnnonceur ? "Booste ton annonce" : "Booste ta recherche"}
        </h1>
        <p className="mt-1 mb-6 text-ink/60">
          {estAnnonceur
            ? "Trouve le bon coloc plus vite. Pas d'abonnement : tu paies seulement quand tu en as besoin."
            : "10 swipes gratuits par jour. Pour aller plus loin, choisis ton pack, sans engagement."}
        </p>

        {lancement && (
          <div className="bg-signature mb-5 flex items-center gap-3 rounded-2xl p-4 text-white">
            <Gift className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-display text-lg font-bold leading-tight">
                Offre de lancement 🎉
              </p>
              <p className="text-sm leading-snug text-white/90">
                Tout est <strong>gratuit aujourd&apos;hui</strong> — profite-en,
                ce sera <strong>payant bientôt</strong>&nbsp;!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {estAnnonceur ? (
            // ----- Annonceur : un seul bloc -----
            !listing ? (
              <div className="rounded-3xl bg-panel p-6 text-center text-ink/70">
                <Rocket className="mx-auto h-10 w-10 text-bleu" />
                <p className="mt-3">
                  Publie d&apos;abord ton annonce pour pouvoir la booster.
                </p>
                <Link
                  href="/mon-annonce"
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
                lancement={lancement}
              />
            )
          ) : (
            // ----- Colocataire : 2 forfaits -----
            <>
              <OffreCard
                icon={<Zap className="h-6 w-6 text-white" />}
                titre="Pack Swiper"
                duree="Par semaine · sans engagement"
                prix="1,99 €"
                avantages={[
                  "Swipes illimités (10 gratuits/jour sans pack)",
                  "Filtres avancés",
                  "Sans engagement — stoppe quand tu veux",
                ]}
                actif={premium}
                actifTexte={`Actif jusqu'au ${dateFr(profile?.premium_until ?? null)}`}
                enCours={enCours === "swiper"}
                onActiver={() => activer("swiper")}
                grad={GRAD_PASS}
                lancement={lancement}
              />

              {/* HeroSwiper — le max (bloc bleu) */}
              <div className="relative rounded-3xl bg-panel p-5 ring-2 ring-bleu">
                <span className="bg-bleu absolute -top-2 right-4 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white">
                  LE MAX
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundImage: GRAD_HERO }}
                  >
                    <Star className="h-6 w-6 text-white" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-xl font-semibold">HeroSwiper</p>
                    <p className="text-sm text-ink/50">
                      Par semaine · sans engagement
                    </p>
                  </div>
                  {lancement ? (
                    <div className="text-right leading-tight">
                      <p className="text-xs text-ink/40 line-through">3,99 €</p>
                      <p
                        className="font-display text-xl font-bold"
                        style={{
                          backgroundImage: GRAD_HERO,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        Gratuit
                      </p>
                    </div>
                  ) : (
                    <p
                      className="font-display text-2xl font-bold"
                      style={{
                        backgroundImage: GRAD_HERO,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      3,99 €
                    </p>
                  )}
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
                  {[
                    "Tout le Pack Swiper",
                    "Annuler le dernier swipe (oups !)",
                    "Vois qui t'a liké",
                    "Ton profil boosté, vu en priorité",
                    "Messages directs : contacte sans attendre un match",
                  ].map((a) => (
                    <li key={a} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-bleu" strokeWidth={3} />
                      {a}
                    </li>
                  ))}
                </ul>
                {hero ? (
                  <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-bleu-clair px-6 py-3 text-sm font-semibold text-bleu">
                    <Check className="h-4 w-4" strokeWidth={3} /> Actif jusqu&apos;au{" "}
                    {dateFr(profile?.hero_until ?? null)}
                  </div>
                ) : (
                  <button
                    onClick={() => activer("pass")}
                    disabled={enCours === "pass"}
                    className="mt-4 w-full rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                    style={{ backgroundImage: GRAD_HERO }}
                  >
                    {enCours === "pass"
                      ? "Activation…"
                      : lancement
                        ? "J'en profite — gratuit"
                        : "Activer (démo)"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Parrainage : gratuit */}
        <div className="mt-4 rounded-3xl bg-panel p-5">
          <p className="font-display text-lg font-semibold">Inviter des amis</p>
          <p className="mt-1 mb-3 text-sm text-ink/60">
            Partage FlatSwiper et gagne des swipes gratuits.
          </p>
          <InviterAmis />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ink/40">
          <Lock className="h-3.5 w-3.5" />
          {lancement
            ? "Offre de lancement : gratuit pour le moment, paiement sécurisé bientôt."
            : "Paiement sécurisé à venir — activation de démo gratuite pour tester."}
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
  lancement = false,
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
  lancement?: boolean;
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
        {lancement ? (
          <div className="text-right leading-tight">
            <p className="text-xs text-ink/40 line-through">{prix}</p>
            <p
              className="font-display text-xl font-bold"
              style={{
                backgroundImage: grad,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Gratuit
            </p>
          </div>
        ) : (
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
        )}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
        {avantages.map((a) => (
          <li key={a} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-bleu" strokeWidth={3} />
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
          {enCours
            ? "Activation…"
            : lancement
              ? "J'en profite — gratuit"
              : "Activer (démo)"}
        </button>
      )}
    </div>
  );
}
