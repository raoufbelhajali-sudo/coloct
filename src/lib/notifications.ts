"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { getMatchesActivite } from "./messages";
import { getLikesRecus } from "./likes";

const cleMatchLu = (id: number) => `colockt-match-lu-${id}`;

// À appeler quand on ouvre une conversation → acquitte ses messages
export function marquerMatchLu(matchId: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(cleMatchLu(matchId), new Date().toISOString());
  }
}

// Nombre de conversations avec du non-lu (nouveau message reçu, ou nouveau
// match jamais ouvert). Disparaît dès que la conversation est ouverte. Poll 5s.
export function useMessagesNonLus(): number {
  const { user } = useAuth();
  const [nb, setNb] = useState(0);

  useEffect(() => {
    if (!user) {
      setNb(0);
      return;
    }
    let actif = true;

    async function calculer() {
      const activite = await getMatchesActivite(user!.id);
      let n = 0;
      for (const a of activite) {
        const lu = localStorage.getItem(cleMatchLu(a.matchId)) || "";
        // non lu = message reçu plus récent que la dernière ouverture,
        // ou match jamais ouvert (pas encore de message)
        const nonLu = a.dernierAutreMsg ? a.dernierAutreMsg > lu : !lu;
        if (nonLu) n++;
      }
      if (actif) setNb(n);
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

// Nombre de "j'aime reçus" non traités (fonctionnalité "Qui vous aime").
export function useLikesRecus(): number {
  const { user, profile } = useAuth();
  const [nb, setNb] = useState(0);

  useEffect(() => {
    if (!user || !profile) {
      setNb(0);
      return;
    }
    let actif = true;

    async function calculer() {
      const likes = await getLikesRecus(user!.id, profile!.role);
      if (actif) setNb(likes.length);
    }

    calculer();
    const t = setInterval(calculer, 5000);
    return () => {
      actif = false;
      clearInterval(t);
    };
  }, [user, profile]);

  return nb;
}
