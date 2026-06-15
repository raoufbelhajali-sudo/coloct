import { supabase } from "./supabase";
import type { Profile } from "./auth";
import { mapListingRow, type ListingRow } from "./listings";
import type { Listing } from "@/data/listings";

// --- Utilisateurs ---
export async function getTousProfils(): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("prenom", { ascending: true });
  return (data as Profile[]) ?? [];
}

export async function definirIdentiteVerifiee(
  userId: string,
  valeur: boolean
): Promise<void> {
  await supabase
    .from("profiles")
    .update({ identite_verifiee: valeur })
    .eq("id", userId);
}

// Lien temporaire (signé) vers la dernière pièce d'identité déposée par un user.
export async function getPieceIdentiteUrl(userId: string): Promise<string | null> {
  const { data: fichiers } = await supabase.storage
    .from("identites")
    .list(userId, { sortBy: { column: "created_at", order: "desc" } });
  const dernier = fichiers?.[0];
  if (!dernier) return null;
  const { data } = await supabase.storage
    .from("identites")
    .createSignedUrl(`${userId}/${dernier.name}`, 60 * 10); // 10 min
  return data?.signedUrl ?? null;
}

// Suspendre / réactiver un compte (drapeau suspendu sur le profil)
export async function suspendreProfil(userId: string, valeur: boolean): Promise<void> {
  await supabase.from("profiles").update({ suspendu: valeur }).eq("id", userId);
}

// --- Annonces ---
export async function getToutesAnnonces(): Promise<Listing[]> {
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("id", { ascending: false });
  return ((data as ListingRow[]) ?? []).map(mapListingRow);
}

export async function gelerAnnonce(id: string, gelee: boolean): Promise<void> {
  await supabase.from("listings").update({ gelee }).eq("id", Number(id));
}

export async function supprimerAnnonce(id: string): Promise<void> {
  await supabase.from("listings").delete().eq("id", Number(id));
}

// --- Tableau de bord : compteurs ---
export type AdminStats = {
  users: number; annonceurs: number; colocataires: number; annonces: number;
  matchs: number; signalements: number; avis: number;
};

async function compter(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filtre?: (q: any) => any
): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filtre) q = filtre(q);
  const { count } = await q;
  return count ?? 0;
}

export async function getStats(): Promise<AdminStats> {
  const [users, annonceurs, colocataires, annonces, matchs, signalements, avis] =
    await Promise.all([
      compter("profiles"),
      compter("profiles", (q) => q.eq("role", "locataire")),
      compter("profiles", (q) => q.eq("role", "colocataire")),
      compter("listings"),
      compter("matches"),
      compter("reports"),
      compter("reviews"),
    ]);
  return { users, annonceurs, colocataires, annonces, matchs, signalements, avis };
}

// --- Vérifications d'identité en attente ---
// Utilisateurs ayant déposé une pièce (dossier dans le bucket) mais pas encore vérifiés.
export async function getVerifsEnAttente(): Promise<Profile[]> {
  const { data: dossiers } = await supabase.storage
    .from("identites")
    .list("", { limit: 1000 });
  const ids = (dossiers ?? [])
    .map((d) => d.name)
    .filter((n) => n && n.length >= 20); // dossiers = id utilisateur (uuid)
  if (ids.length === 0) return [];
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return ((data as Profile[]) ?? []).filter((p) => !p.identite_verifiee);
}

// --- Signalements ---
export type Signalement = {
  id: number; raison: string; details: string | null; created_at: string;
  auteur: string; vise: string; viseId: string;
};

export async function getSignalements(): Promise<Signalement[]> {
  const { data } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data as Record<string, unknown>[]) ?? [];
  const ids = [
    ...new Set(rows.flatMap((r) => [r.reporter_id as string, r.reported_id as string])),
  ];
  const noms = await nomsParId(ids);
  return rows.map((r) => ({
    id: r.id as number,
    raison: r.raison as string,
    details: (r.details as string) ?? null,
    created_at: r.created_at as string,
    auteur: noms.get(r.reporter_id as string) ?? "—",
    vise: noms.get(r.reported_id as string) ?? "—",
    viseId: r.reported_id as string,
  }));
}

export async function supprimerSignalement(id: number): Promise<void> {
  await supabase.from("reports").delete().eq("id", id);
}

// --- Avis ---
export type AvisAdmin = {
  reviewerId: string; reviewedId: string; note: number;
  commentaire: string | null; created_at: string | null; auteur: string; vise: string;
};

export async function getAvis(): Promise<AvisAdmin[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data as Record<string, unknown>[]) ?? [];
  const ids = [
    ...new Set(rows.flatMap((r) => [r.reviewer_id as string, r.reviewed_id as string])),
  ];
  const noms = await nomsParId(ids);
  return rows.map((r) => ({
    reviewerId: r.reviewer_id as string,
    reviewedId: r.reviewed_id as string,
    note: r.note as number,
    commentaire: (r.commentaire as string) ?? null,
    created_at: (r.created_at as string) ?? null,
    auteur: noms.get(r.reviewer_id as string) ?? "—",
    vise: noms.get(r.reviewed_id as string) ?? "—",
  }));
}

export async function supprimerAvis(reviewerId: string, reviewedId: string): Promise<void> {
  await supabase
    .from("reviews")
    .delete()
    .eq("reviewer_id", reviewerId)
    .eq("reviewed_id", reviewedId);
}

// Récupère les prénoms (ou pseudo) pour une liste d'ids.
async function nomsParId(ids: string[]): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  if (ids.length === 0) return m;
  const { data } = await supabase
    .from("profiles")
    .select("id, prenom, pseudo")
    .in("id", ids);
  (data ?? []).forEach((p: Record<string, unknown>) => {
    m.set(p.id as string, (p.prenom as string) || (p.pseudo as string) || "—");
  });
  return m;
}
