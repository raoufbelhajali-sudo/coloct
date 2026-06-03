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
