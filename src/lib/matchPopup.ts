// Suivi des matchs déjà "annoncés" (pop-up affichée) — par compte/navigateur.

const cle = (userId: string) => `colockt-matchs-annonces-${userId}`;

export function getAnnonces(userId: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(cle(userId)) || "[]"));
  } catch {
    return new Set();
  }
}

export function marquerAnnonce(userId: string, matchId: number): void {
  if (typeof window === "undefined") return;
  const s = getAnnonces(userId);
  s.add(matchId);
  localStorage.setItem(cle(userId), JSON.stringify([...s]));
}
