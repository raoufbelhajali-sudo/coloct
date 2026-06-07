import { supabase } from "./supabase";

// Met à jour la dernière activité de l'utilisateur (badge "actif récemment")
export async function toucherActivite(userId: string): Promise<void> {
  await supabase
    .from("profiles")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", userId);
}

// Actif il y a moins de 3 jours ?
export function estActifRecemment(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false;
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff < 3 * 24 * 60 * 60 * 1000;
}
