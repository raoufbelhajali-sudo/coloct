import { supabase } from "./supabase";

// Bonus accordé au parrain : swipes/jour supplémentaires par filleul inscrit.
export const BONUS_PARRAIN = 10;

const CLE_REF = "fs-parrain";

// Capte le ?ref=<id parrain> dans l'URL et le mémorise (l'inscription a lieu
// plus tard). Appelé au chargement de l'app.
export function capterRefParrain(): void {
  if (typeof window === "undefined") return;
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem(CLE_REF, ref);
  } catch {
    /* stockage indisponible */
  }
}

export function getRefParrain(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CLE_REF);
  } catch {
    return null;
  }
}

export function effacerRefParrain(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLE_REF);
  } catch {
    /* ignore */
  }
}

// Enregistre le parrainage (le filleul = l'utilisateur courant). Idempotent :
// la clé primaire empêche les doublons, on ignore donc l'erreur si déjà parrainé.
export async function enregistrerParrainage(
  filleulId: string,
  parrainId: string | null
): Promise<void> {
  if (!parrainId || parrainId === filleulId) return;
  await supabase
    .from("parrainages")
    .insert({ filleul_id: filleulId, parrain_id: parrainId });
}

// Nombre de filleuls inscrits grâce à moi
export async function getNbFilleuls(userId: string): Promise<number> {
  const { count } = await supabase
    .from("parrainages")
    .select("*", { count: "exact", head: true })
    .eq("parrain_id", userId);
  return count ?? 0;
}
