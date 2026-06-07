import { supabase } from "./supabase";
import type { Listing } from "@/data/listings";
import { attacherAnnonceurs, type ListingRow } from "./listings";

// Les ids d'annonces mises en favori par l'utilisateur
export async function getFavorisIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("favoris")
    .select("listing_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => String(r.listing_id)));
}

// Les annonces favorites (complètes), de la plus récente à la plus ancienne
export async function getFavorisListings(userId: string): Promise<Listing[]> {
  const { data: favs } = await supabase
    .from("favoris")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const ids = (favs ?? []).map((f) => f.listing_id);
  if (ids.length === 0) return [];
  const { data: rows } = await supabase
    .from("listings")
    .select("*")
    .in("id", ids);
  const listings = await attacherAnnonceurs((rows as ListingRow[]) ?? []);
  // On garde l'ordre des favoris
  const ordre = new Map(ids.map((id, i) => [String(id), i]));
  return listings.sort(
    (a, b) => (ordre.get(a.id) ?? 0) - (ordre.get(b.id) ?? 0)
  );
}

// Ajoute / retire un favori
export async function ajouterFavori(
  userId: string,
  listingId: string
): Promise<void> {
  await supabase
    .from("favoris")
    .insert({ user_id: userId, listing_id: Number(listingId) });
}

export async function retirerFavori(
  userId: string,
  listingId: string
): Promise<void> {
  await supabase
    .from("favoris")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", Number(listingId));
}
