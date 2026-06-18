"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";

// Mot de passe d'accès anticipé au SITE web (modifiable ici).
// NB : c'est une protection "coming soon" côté navigateur — suffisante avant
// le lancement. L'app iPhone (native) n'est JAMAIS bloquée.
const MOT_DE_PASSE = "FlatSwiper2026";
const CLE_ACCES = "flatswiper-acces-anticipe";

// 🔓 Site OUVERT au public : mettre `true` pour réactiver la page "Bientôt disponible".
// (true = site EN VEILLE — on reconstruit le web en site d'annonces ; l'app n'est jamais bloquée)
const SITE_FERME = false;

export default function ComingSoonGate({
  children,
}: {
  children: React.ReactNode;
}) {

  const [verifie, setVerifie] = useState(false); // a-t-on fini de décider ?
  const [autorise, setAutorise] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState(false);

  // Page toujours accessible même site en veille : le back-office (qui a sa
  // propre connexion par lien magique, comme sur PetSwip).
  const pathname = usePathname();
  const exempt = !!pathname && pathname.startsWith("/admyn");

  useEffect(() => {
    // Dans l'app native : accès total, aucune porte.
    if (Capacitor.isNativePlatform()) {
      setAutorise(true);
      setVerifie(true);
      return;
    }
    // Sur le web : on regarde si l'accès a déjà été débloqué.
    try {
      if (localStorage.getItem(CLE_ACCES) === "1") setAutorise(true);
    } catch {
      /* ignore */
    }
    setVerifie(true);
  }, []);

  function valider(e: React.FormEvent) {
    e.preventDefault();
    if (saisie.trim() === MOT_DE_PASSE) {
      try {
        localStorage.setItem(CLE_ACCES, "1");
      } catch {
        /* ignore */
      }
      setAutorise(true);
    } else {
      setErreur(true);
    }
  }

  // Évite tout clignotement avant d'avoir décidé
  // Site ouvert au public : aucune porte.
  if (!SITE_FERME || exempt) return <>{children}</>;
  if (!verifie) return null;
  if (autorise) return <>{children}</>;

  // ----- Page "Bientôt disponible" + mot de passe (web uniquement) -----
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet opacity-20 blur-[120px]" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-full.png"
        alt="FlatSwiper"
        className="mb-2 w-[320px] max-w-[85%] drop-shadow-[0_8px_30px_rgba(250,82,82,0.25)]"
      />
      <p className="mt-4 max-w-md text-lg text-ink/70">
        Bientôt disponible. Trouve ta co/location en swipant, partout en France.
      </p>

      <form
        onSubmit={valider}
        className="mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        <input
          type="password"
          autoFocus
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value);
            setErreur(false);
          }}
          placeholder="Mot de passe d'accès anticipé"
          className="w-full rounded-full border border-ink/15 bg-panel px-5 py-3.5 text-center text-ink outline-none focus:border-pink"
        />
        {erreur && (
          <p className="text-sm text-pink">Mot de passe incorrect.</p>
        )}
        <button
          type="submit"
          className="bg-signature glow-pink rounded-full px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Entrer
        </button>
      </form>

      <p className="absolute bottom-6 text-xs text-ink/40">
        © {new Date().getFullYear()} FlatSwiper
      </p>
    </main>
  );
}
