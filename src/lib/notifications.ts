"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { getMatchesActivite } from "./messages";

// Clés localStorage
const CLE_LISTE_VUE = "colockt-matchs-vus"; // dernière ouverture de /matchs
const cleMatchLu = (id: number) => `colockt-match-lu-${id}`; // ouverture d'une conv

// À appeler quand l'utilisateur ouvre la liste des matchs → acquitte les nouveaux matchs
export function marquerMatchsVus() {
  if (typeof window !== "undefined") {
    localStorage.setItem(CLE_LISTE_VUE, new Date().toISOString());
  }
}

// À appeler quand l'utilisateur ouvre une conversation → acquitte ses messages
export function marquerMatchLu(matchId: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(cleMatchLu(matchId), new Date().toISOString());
  }
}

// Compteur de notifications : nouveaux matchs (non acquittés) + matchs avec
// des messages reçus non lus. Se met à jour toutes les 5 s.
export function useNonLus(): number {
  const { user } = useAuth();
  const [compteur, setCompteur] = useState(0);

  useEffect(() => {
    if (!user) {
      setCompteur(0);
      return;
    }
    let actif = true;

    async function calculer() {
      const activite = await getMatchesActivite(user!.id);
      const listeVue = localStorage.getItem(CLE_LISTE_VUE) || "";
      let n = 0;
      for (const a of activite) {
        const lu = localStorage.getItem(cleMatchLu(a.matchId)) || "";
        const nouveauMatch = a.createdAt > listeVue; // match arrivé depuis la dernière visite
        const messageNonLu = a.dernierAutreMsg ? a.dernierAutreMsg > lu : false;
        if (nouveauMatch || messageNonLu) n++;
      }
      if (actif) setCompteur(n);
    }

    calculer();
    const t = setInterval(calculer, 5000);
    return () => {
      actif = false;
      clearInterval(t);
    };
  }, [user]);

  return compteur;
}
