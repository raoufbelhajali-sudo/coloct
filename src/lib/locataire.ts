import { supabase } from "./supabase";
import type { Listing } from "@/data/listings";
import type { Profile } from "./auth";
import { mapListingRow, type ListingRow } from "./listings";

// L'annonce (le bien) du locataire connecté — ou null s'il n'en a pas encore
export async function getMyListing(userId: string): Promise<Listing | null> {
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", userId)
    .order("id")
    .limit(1)
    .maybeSingle();
  return data ? mapListingRow(data as ListingRow) : null;
}

// Données d'une nouvelle annonce à créer
export type NewListing = {
  loyer: number;
  quartier: string;
  arrondissement: number;
  surface: number;
  meuble: boolean;
  etage: string;
  dispo: string; // AAAA-MM-JJ
  date_dispo: string; // texte lisible
  description: string;
  photos: string[];
  criteres: string[];
  colocs: { prenom: string; age: number; ambiance: string }[];
};

// Crée l'annonce du locataire
export async function createListing(
  userId: string,
  l: NewListing
): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .insert({ ...l, owner_id: userId });
  if (error) throw error;
}

// Profils des colocataires déjà swipés par ce locataire (pour cette annonce)
export async function getSwipedProfileIds(
  userId: string,
  listingId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("swipes")
    .select("target_user_id")
    .eq("swiper_id", userId)
    .eq("listing_id", Number(listingId))
    .not("target_user_id", "is", null);
  return new Set((data ?? []).map((r) => String(r.target_user_id)));
}

// Les profils de colocataires à proposer au locataire (hors lui-même et hors déjà swipés)
export async function getColocataireProfiles(
  excludeUserId: string,
  swipedIds: Set<string>
): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "colocataire");
  return (data as Profile[] | null ?? []).filter(
    (p) => p.id !== excludeUserId && !swipedIds.has(p.id)
  );
}

// Enregistre le swipe d'un locataire sur un profil de colocataire
export async function recordProfileSwipe(
  userId: string,
  listingId: string,
  targetUserId: string,
  direction: "like" | "pass"
): Promise<void> {
  await supabase.from("swipes").insert({
    swiper_id: userId,
    listing_id: Number(listingId),
    target_user_id: targetUserId,
    direction,
  });
}

// Y a-t-il un match entre ce colocataire et cette annonce ?
export async function findMatchForColocataire(
  colocataireId: string,
  listingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .eq("colocataire_id", colocataireId)
    .eq("listing_id", Number(listingId))
    .maybeSingle();
  return !!data;
}
