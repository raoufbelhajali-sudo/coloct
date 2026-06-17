"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, type Role } from "@/lib/auth";
import Onboarding from "@/components/Onboarding";

// On mémorise l'adresse de retour DÈS le chargement du module, avant que
// Supabase ne nettoie le "#..." de l'URL. Ça nous permet de lire un éventuel
// message d'erreur renvoyé par Google / Supabase.
const RETOUR_BRUT =
  typeof window !== "undefined"
    ? window.location.hash.replace(/^#/, "") ||
      window.location.search.replace(/^\?/, "")
    : "";

function analyseRetour() {
  const p = new URLSearchParams(RETOUR_BRUT);
  const brut =
    p.get("error_description") || p.get("error_code") || p.get("error") || "";
  const aSession = Boolean(
    p.get("access_token") || p.get("code") || p.get("provider_token")
  );
  return {
    erreur: brut ? decodeURIComponent(brut.replace(/\+/g, " ")) : "",
    retourOAuth: Boolean(brut) || aSession,
  };
}

export default function BienvenuePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [pret, setPret] = useState(false); // prêt à montrer le parcours
  const [authErr, setAuthErr] = useState("");
  const [prenomInitial, setPrenomInitial] = useState("");
  const [besoinEmail, setBesoinEmail] = useState(false);

  function redirige(r: Role) {
    router.replace(r === "locataire" ? "/locataire" : "/swipe");
  }

  useEffect(() => {
    const { erreur, retourOAuth } = analyseRetour();

    // Google / Supabase nous a renvoyé une erreur → on l'affiche
    if (erreur) {
      setAuthErr(erreur);
      return;
    }

    if (loading) return;

    if (!user) {
      // On revient de Google mais aucune session n'a été établie → on le dit
      if (retourOAuth) {
        setAuthErr(
          "La connexion Google s'est interrompue : aucune session reçue."
        );
        return;
      }
      router.replace("/connexion");
      return;
    }
    if (!profile) return;

    // Déjà passé par le parcours (prénom renseigné) → on file vers son espace.
    // Un compte tout neuf a prenom = "Anonyme" → on montre le parcours.
    if (profile.prenom && profile.prenom !== "Anonyme") {
      redirige(profile.role);
      return;
    }

    // Nouveau venu : on pré-remplit le prénom avec son nom Google s'il y en a un
    const meta = user.user_metadata as Record<string, string> | undefined;
    const nomGoogle = meta?.given_name || meta?.name || meta?.full_name || "";
    setPrenomInitial(nomGoogle.split(" ")[0] || "");
    setBesoinEmail(!user.email); // connecté par téléphone → on demandera l'email
    setPret(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profile]);

  if (authErr) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 font-display text-2xl font-semibold">
          Connexion Google interrompue
        </h1>
        <p className="mb-2 max-w-sm text-ink/70">
          On n&apos;a pas pu finaliser la connexion. Détail technique (utile
          pour corriger) :
        </p>
        <p className="mb-6 max-w-sm break-words rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">
          {authErr}
        </p>
        <Link
          href="/connexion"
          className="bg-signature glow-pink rounded-full px-6 py-3 font-semibold text-white"
        >
          Réessayer
        </Link>
      </main>
    );
  }

  if (!pret) {
    return (
      <main className="flex min-h-screen items-center justify-center text-ink/60">
        Un instant…
      </main>
    );
  }

  return <Onboarding prenomInitial={prenomInitial} besoinEmail={besoinEmail} />;
}
