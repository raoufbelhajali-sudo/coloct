import { supabase } from "./supabase";
import type { Profile } from "./auth";

// Le Pass Express (premium) est-il actif ?
export function estPremium(profile: Profile | null): boolean {
  return (
    !!profile?.premium_until &&
    new Date(profile.premium_until).getTime() > Date.now()
  );
}

// Une date de boost est-elle encore valide ?
export function boostActif(until: string | null | undefined): boolean {
  return !!until && new Date(until).getTime() > Date.now();
}

// Le Boost du profil est-il actif ?
export function estBooste(profile: Profile | null): boolean {
  return boostActif(profile?.boosted_until);
}

// Active le Boost d'une annonce pour 48h (démo — sans paiement réel)
export async function activerBoostAnnonce(listingId: string): Promise<void> {
  const fin = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase
    .from("listings")
    .update({ boosted_until: fin.toISOString() })
    .eq("id", Number(listingId));
}

// Active le Pass Express pour 7 jours (démo — sans paiement réel)
export async function activerPassExpress(userId: string): Promise<void> {
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await supabase
    .from("profiles")
    .update({ premium_until: fin.toISOString() })
    .eq("id", userId);
}

// Boost Annonceur (démo, 5 €) : met l'annonce en avant 7 jours ET débloque
// l'accès aux meilleurs profils (premium_until → tri par poste + compatibilité).
export async function activerBoostAnnonceur(
  userId: string,
  listingId: string
): Promise<void> {
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("profiles").update({ premium_until: fin }).eq("id", userId);
  await supabase
    .from("listings")
    .update({ boosted_until: fin })
    .eq("id", Number(listingId));
}

// Active le Boost pour 48h (démo — sans paiement réel)
export async function activerBoost(userId: string): Promise<void> {
  const fin = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase
    .from("profiles")
    .update({ boosted_until: fin.toISOString() })
    .eq("id", userId);
}
