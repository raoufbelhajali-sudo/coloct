"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

// Petit rappel affiché à l'ouverture d'un détail (annonce OU profil), des deux
// côtés (chercheur et annonceur) : il est interdit de partager des coordonnées
// (email / téléphone), pour respecter le règlement et les données personnelles.
// S'efface tout seul après quelques secondes (ou au clic sur la croix).
export default function AvertissementCoordonnees() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center px-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.6rem)" }}
    >
      <div className="pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-2xl bg-ink/95 px-3.5 py-2.5 text-white shadow-xl backdrop-blur">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#fa5252]" />
        <p className="flex-1 text-[12px] font-medium leading-snug">
          Pour respecter le règlement et les données personnelles, il est interdit
          de partager une adresse e-mail ou un numéro de téléphone.
        </p>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="-mr-1 shrink-0 text-white/70 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
