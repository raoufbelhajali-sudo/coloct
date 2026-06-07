import { supabase } from "./supabase";

// Note moyenne (et nombre d'avis) reçue par un utilisateur
export async function getNoteMoyenne(
  userId: string
): Promise<{ moyenne: number; nombre: number }> {
  const { data } = await supabase
    .from("reviews")
    .select("note")
    .eq("reviewed_id", userId);
  const notes = (data ?? []).map((r) => r.note as number);
  if (notes.length === 0) return { moyenne: 0, nombre: 0 };
  const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
  return { moyenne: Math.round(moyenne * 10) / 10, nombre: notes.length };
}

// Mon avis déjà laissé sur quelqu'un (ou null)
export async function getMonAvis(
  reviewerId: string,
  reviewedId: string
): Promise<{ note: number; commentaire: string | null } | null> {
  const { data } = await supabase
    .from("reviews")
    .select("note, commentaire")
    .eq("reviewer_id", reviewerId)
    .eq("reviewed_id", reviewedId)
    .maybeSingle();
  return data ?? null;
}

// Laisse (ou met à jour) un avis sur quelqu'un
export async function laisserAvis(
  reviewerId: string,
  reviewedId: string,
  note: number,
  commentaire: string
): Promise<{ error?: string }> {
  const { error } = await supabase.from("reviews").upsert(
    {
      reviewer_id: reviewerId,
      reviewed_id: reviewedId,
      note,
      commentaire: commentaire.trim() || null,
    },
    { onConflict: "reviewer_id,reviewed_id" }
  );
  return error ? { error: error.message } : {};
}
