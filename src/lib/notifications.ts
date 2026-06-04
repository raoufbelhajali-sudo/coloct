"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { getMatchesActivite } from "./messages";

// Nombre total de matchs du compte (affiché en pastille sur l'icône cœur).
// Se met à jour toutes les 5 s pour refléter les nouveaux matchs en direct.
export function useNbMatchs(): number {
  const { user } = useAuth();
  const [nb, setNb] = useState(0);

  useEffect(() => {
    if (!user) {
      setNb(0);
      return;
    }
    let actif = true;

    async function calculer() {
      const matchs = await getMatchesActivite(user!.id);
      if (actif) setNb(matchs.length);
    }

    calculer();
    const t = setInterval(calculer, 5000);
    return () => {
      actif = false;
      clearInterval(t);
    };
  }, [user]);

  return nb;
}
