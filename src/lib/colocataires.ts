import { supabase } from "./supabase";
import type { Profile } from "./auth";

// Profils PUBLICS de colocataires en recherche de colocation (pour le site).
// RLS : lecture des profils autorisée à tous. On ne montre que ceux qui ont
// une photo (profil présentable).
export async function getColocatairesPublics(limit = 60): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "colocataire")
    .not("photo_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Profile[]) ?? [];
}
