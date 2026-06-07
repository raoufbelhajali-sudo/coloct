import { supabase } from "./supabase";

// Motifs de signalement proposés
export const RAISONS_SIGNALEMENT = [
  "Profil faux / usurpation",
  "Arnaque ou demande d'argent",
  "Propos déplacés ou harcèlement",
  "Annonce trompeuse",
  "Autre",
];

// Signale un utilisateur (profil/annonceur/colocataire)
export async function signalerUtilisateur(
  reporterId: string,
  reportedId: string,
  raison: string,
  details?: string
): Promise<{ error?: string }> {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    raison,
    details: details?.trim() || null,
  });
  return error ? { error: error.message } : {};
}
