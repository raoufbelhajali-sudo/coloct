import { supabase } from "./supabase";
import type { Profile } from "./auth";
import type { Listing } from "@/data/listings";
import { attacherAnnonceurs, type ListingRow } from "./listings";

// Un "j'aime reçu" à afficher dans "Qui vous aime"
export type LikeRecu =
  | {
      kind: "listing"; // un locataire m'a liké → je vois SON annonce
      swipeId: number;
      listingId: string;
      listing: Listing;
      date: string;
    }
  | {
      kind: "profile"; // un colocataire a liké mon annonce → je vois SON profil
      swipeId: number;
      listingId: string;
      colocataireId: string;
      profile: Profile;
      date: string;
    };

// Récupère les "j'aime" reçus, pas encore traités (ni répondus, ni déjà en match)
export async function getLikesRecus(
  userId: string,
  role: "colocataire" | "locataire"
): Promise<LikeRecu[]> {
  if (role === "colocataire") {
    // Des locataires m'ont liké (target_user_id = moi)
    const { data: recus } = await supabase
      .from("swipes")
      .select("id, listing_id, created_at")
      .eq("target_user_id", userId)
      .eq("direction", "like")
      .order("created_at", { ascending: false });
    if (!recus || recus.length === 0) return [];

    // Annonces que j'ai déjà swipées (donc déjà traitées)
    const { data: mine } = await supabase
      .from("swipes")
      .select("listing_id")
      .eq("swiper_id", userId)
      .not("listing_id", "is", null);
    const repondu = new Set((mine ?? []).map((s) => String(s.listing_id)));

    // Annonces déjà en match
    const { data: matchs } = await supabase
      .from("matches")
      .select("listing_id")
      .eq("colocataire_id", userId);
    const matched = new Set((matchs ?? []).map((m) => String(m.listing_id)));

    const pend = recus.filter(
      (r) =>
        !repondu.has(String(r.listing_id)) && !matched.has(String(r.listing_id))
    );
    if (pend.length === 0) return [];

    const ids = [...new Set(pend.map((p) => p.listing_id))];
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .in("id", ids);
    const annonces = await attacherAnnonceurs((listingsData as ListingRow[]) ?? []);
    const byId = new Map(annonces.map((l) => [l.id, l]));

    return pend
      .filter((p) => byId.has(String(p.listing_id)))
      .map((p) => ({
        kind: "listing" as const,
        swipeId: p.id,
        listingId: String(p.listing_id),
        listing: byId.get(String(p.listing_id))!,
        date: p.created_at,
      }));
  }

  // ----- Locataire : des colocataires ont liké mes annonces -----
  const { data: myListings } = await supabase
    .from("listings")
    .select("id")
    .eq("owner_id", userId);
  const myIds = (myListings ?? []).map((l) => l.id);
  if (myIds.length === 0) return [];

  const { data: recus } = await supabase
    .from("swipes")
    .select("id, listing_id, swiper_id, created_at")
    .is("target_user_id", null)
    .in("listing_id", myIds)
    .eq("direction", "like")
    .order("created_at", { ascending: false });
  if (!recus || recus.length === 0) return [];

  // Colocataires que j'ai déjà swipés (déjà traités)
  const { data: mine } = await supabase
    .from("swipes")
    .select("listing_id, target_user_id")
    .eq("swiper_id", userId)
    .not("target_user_id", "is", null);
  const repondu = new Set(
    (mine ?? []).map((s) => `${s.listing_id}:${s.target_user_id}`)
  );

  // Déjà en match
  const { data: matchs } = await supabase
    .from("matches")
    .select("colocataire_id, listing_id")
    .eq("locataire_id", userId);
  const matched = new Set(
    (matchs ?? []).map((m) => `${m.listing_id}:${m.colocataire_id}`)
  );

  const pend = recus.filter(
    (r) =>
      r.swiper_id !== userId &&
      !repondu.has(`${r.listing_id}:${r.swiper_id}`) &&
      !matched.has(`${r.listing_id}:${r.swiper_id}`)
  );
  if (pend.length === 0) return [];

  const userIds = [...new Set(pend.map((p) => p.swiper_id))];
  const { data: profs } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);
  const byU = new Map(((profs as Profile[]) ?? []).map((p) => [p.id, p]));

  return pend
    .filter((p) => byU.has(p.swiper_id))
    .map((p) => ({
      kind: "profile" as const,
      swipeId: p.id,
      listingId: String(p.listing_id),
      colocataireId: p.swiper_id,
      profile: byU.get(p.swiper_id)!,
      date: p.created_at,
    }));
}

// Répond à un "j'aime reçu" : like (→ crée le match) ou pass
export async function repondreLike(
  userId: string,
  item: LikeRecu,
  direction: "like" | "pass"
): Promise<void> {
  if (item.kind === "listing") {
    // Je suis colocataire → je swipe l'annonce du locataire
    await supabase.from("swipes").insert({
      swiper_id: userId,
      listing_id: Number(item.listingId),
      direction,
    });
  } else {
    // Je suis locataire → je swipe le colocataire
    await supabase.from("swipes").insert({
      swiper_id: userId,
      listing_id: Number(item.listingId),
      target_user_id: item.colocataireId,
      direction,
    });
  }
}
