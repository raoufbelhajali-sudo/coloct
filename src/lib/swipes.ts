import { supabase } from "./supabase";

// Les annonces déjà swipées par ce colocataire (pour ne plus les remontrer)
export async function getSwipedListingIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("swipes")
    .select("listing_id")
    .eq("swiper_id", userId)
    .not("listing_id", "is", null);
  return new Set((data ?? []).map((r) => String(r.listing_id)));
}

// Enregistre le swipe d'un colocataire sur une annonce
export async function recordListingSwipe(
  userId: string,
  listingId: string,
  direction: "like" | "pass"
): Promise<void> {
  await supabase.from("swipes").insert({
    swiper_id: userId,
    listing_id: Number(listingId),
    direction,
  });
}

// Compte les "j'aime" donnés aujourd'hui (depuis minuit) par ce colocataire
export async function getLikesToday(userId: string): Promise<number> {
  const minuit = new Date();
  minuit.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("swipes")
    .select("id", { count: "exact", head: true })
    .eq("swiper_id", userId)
    .eq("direction", "like")
    .not("listing_id", "is", null)
    .gte("created_at", minuit.toISOString());
  return count ?? 0;
}

// --- Swipes bonus (parrainage) : crédités quand on invite des amis ---
function cleBonus(userId: string): string {
  const jour = new Date().toISOString().slice(0, 10); // remis à zéro chaque jour
  return `colockt-bonus-${userId}-${jour}`;
}
export function getBonusLikes(userId: string): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(cleBonus(userId)) || 0);
}
export function ajouterBonusLikes(userId: string, n: number): number {
  const total = Math.min(getBonusLikes(userId) + n, 30); // plafond /jour
  if (typeof window !== "undefined") {
    localStorage.setItem(cleBonus(userId), String(total));
  }
  return total;
}

// Vérifie si un match (réciproque) existe pour ce colocataire et cette annonce
export async function findMatchForListing(
  userId: string,
  listingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .eq("colocataire_id", userId)
    .eq("listing_id", Number(listingId))
    .maybeSingle();
  return !!data;
}
