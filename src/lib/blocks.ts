import { supabase } from "./supabase";

// Bloque un utilisateur
export async function bloquerUtilisateur(
  blockerId: string,
  blockedId: string
): Promise<void> {
  await supabase
    .from("blocks")
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
}

// Ensemble des ids à masquer pour moi : ceux que j'ai bloqués + ceux qui m'ont bloqué
export async function getIdsBloques(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  const ids = new Set<string>();
  for (const b of data ?? []) {
    ids.add(b.blocker_id === userId ? b.blocked_id : b.blocker_id);
  }
  return ids;
}
