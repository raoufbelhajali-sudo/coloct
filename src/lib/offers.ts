import { supabase } from "./supabase";
import type { Profile } from "./auth";

// Le Pass Express (premium) est-il actif ?
export function estPremium(profile: Profile | null): boolean {
  return (
    !!profile?.premium_until &&
    new Date(profile.premium_until).getTime() > Date.now()
  );
}

// Le Boost est-il actif ?
export function estBooste(profile: Profile | null): boolean {
  return (
    !!profile?.boosted_until &&
    new Date(profile.boosted_until).getTime() > Date.now()
  );
}

// Active le Pass Express pour 7 jours (démo — sans paiement réel)
export async function activerPassExpress(userId: string): Promise<void> {
  const fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await supabase
    .from("profiles")
    .update({ premium_until: fin.toISOString() })
    .eq("id", userId);
}

// Active le Boost pour 48h (démo — sans paiement réel)
export async function activerBoost(userId: string): Promise<void> {
  const fin = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await supabase
    .from("profiles")
    .update({ boosted_until: fin.toISOString() })
    .eq("id", userId);
}
