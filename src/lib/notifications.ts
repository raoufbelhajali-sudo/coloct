"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth";
import { getMatchesActivite } from "./messages";
import { getLikesRecus } from "./likes";

// Clé propre à CHAQUE compte (sinon, en testant 2 comptes dans le même
// navigateur, ouvrir une conv effacerait la notif de l'autre compte).
const cleMatchLu = (userId: string, id: number) =>
  `colockt-match-lu-${userId}-${id}`;

// À appeler quand on ouvre une conversation → acquitte ses messages
export function marquerMatchLu(userId: string, matchId: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(cleMatchLu(userId, matchId), new Date().toISOString());
  }
}

// Une conversation est-elle non lue ? (dernier message reçu plus récent que
// la dernière ouverture). Utilisé pour styliser la boîte de réception.
export function estMatchNonLu(
  userId: string,
  matchId: number,
  dernierAutreMsg: string | null
): boolean {
  if (typeof window === "undefined") return false;
  const lu = localStorage.getItem(cleMatchLu(userId, matchId)) || "";
  return dernierAutreMsg ? dernierAutreMsg > lu : false;
}

// Conversations non lues (badge) + alerte transitoire quand un NOUVEAU message
// arrive (bandeau in-app + notification système si autorisée). Poll 5s.
export function useMessagesNonLus(): { count: number; alerte: string } {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [alerte, setAlerte] = useState("");
  const dernierVu = useRef<string | null>(null); // référence du dernier message reçu

  useEffect(() => {
    if (!user) {
      setCount(0);
      dernierVu.current = null;
      return;
    }
    let actif = true;

    async function calculer() {
      const activite = await getMatchesActivite(user!.id);
      let n = 0;
      let plusRecent = "";
      for (const a of activite) {
        const lu = localStorage.getItem(cleMatchLu(user!.id, a.matchId)) || "";
        // non lu = message reçu plus récent que la dernière ouverture,
        // ou match jamais ouvert (pas encore de message)
        const nonLu = a.dernierAutreMsg ? a.dernierAutreMsg > lu : !lu;
        if (nonLu) n++;
        if (a.dernierAutreMsg && a.dernierAutreMsg > plusRecent)
          plusRecent = a.dernierAutreMsg;
      }
      if (!actif) return;
      setCount(n);

      // Détection d'un nouveau message reçu depuis le dernier passage
      if (dernierVu.current === null) {
        dernierVu.current = plusRecent; // premier passage = référence
      } else if (plusRecent && plusRecent > dernierVu.current) {
        dernierVu.current = plusRecent;
        setAlerte("Nouveau message reçu");
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("FlatSwiper", {
              body: "Tu as reçu un nouveau message",
            });
          } catch {
            /* certains navigateurs refusent en dehors d'un service worker */
          }
        }
        window.setTimeout(() => {
          if (actif) setAlerte("");
        }, 4000);
      }
    }

    calculer();
    const t = setInterval(calculer, 5000);
    return () => {
      actif = false;
      clearInterval(t);
    };
  }, [user]);

  return { count, alerte };
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
