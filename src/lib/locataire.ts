import { supabase } from "./supabase";
import type { Listing } from "@/data/listings";
import type { Profile } from "./auth";
import { mapListingRow, attacherAnnonceurs, type ListingRow } from "./listings";
import { estBooste } from "./offers";

// L'annonce (le bien) du locataire connecté — ou null s'il n'en a pas encore
export async function getMyListing(userId: string): Promise<Listing | null> {
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", userId)
    .order("id")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const [l] = await attacherAnnonceurs([data as ListingRow]);
  return l ?? mapListingRow(data as ListingRow);
}

// Données d'une nouvelle annonce à créer
export type NewListing = {
  titre?: string | null;
  loyer: number;
  quartier: string;
  ville: string;
  departement: string;
  arrondissement?: number | null;
  surface: number;
  nb_occupants?: number | null;
  meuble: boolean;
  etage: string;
  dispo: string; // AAAA-MM-JJ
  date_dispo: string; // texte lisible
  description: string;
  photos: string[];
  criteres: string[];
  services: string[];
  autres_frais?: string | null;
  colocs: { prenom: string; age: number; ambiance: string }[];
  lat?: number | null;
  lng?: number | null;
  statut_annonceur?: string | null;
  type_logement?: string | null;
  nb_colocs_total?: number | null;
  caution?: number | null;
  salle_de_bain?: string | null;
  duree_min_bail?: string | null;
  genre_colocs?: string | null;
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

// Met à jour l'annonce du locataire
export async function updateListing(
  listingId: string,
  l: NewListing
): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ ...l })
    .eq("id", Number(listingId));
  if (error) throw error;
}

// Statistiques d'une annonce (likes reçus, matchs, mises en favori)
export async function getStatsAnnonce(listingId: string): Promise<{
  likes: number;
  matchs: number;
  favoris: number;
}> {
  const lid = Number(listingId);
  const [likes, matchs, favoris] = await Promise.all([
    supabase
      .from("swipes")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", lid)
      .is("target_user_id", null)
      .eq("direction", "like"),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", lid),
    supabase
      .from("favoris")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", lid),
  ]);
  return {
    likes: likes.count ?? 0,
    matchs: matchs.count ?? 0,
    favoris: favoris.count ?? 0,
  };
}

// Gèle (bien loué) ou réactive une annonce
export async function setListingGelee(
  listingId: string,
  gelee: boolean
): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ gelee })
    .eq("id", Number(listingId));
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
  return (data as Profile[] | null ?? [])
    .filter((p) => p.id !== excludeUserId && !swipedIds.has(p.id))
    // Les profils boostés passent en tête
    .sort((a, b) => (estBooste(b) ? 1 : 0) - (estBooste(a) ? 1 : 0));
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
  return (await getMatchIdForColocataire(colocataireId, listingId)) !== null;
}

// Renvoie l'id du match (colocataire ↔ annonce) ou null
export async function getMatchIdForColocataire(
  colocataireId: string,
  listingId: string
): Promise<number | null> {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .eq("colocataire_id", colocataireId)
    .eq("listing_id", Number(listingId))
    .maybeSingle();
  return (data?.id as number) ?? null;
}
