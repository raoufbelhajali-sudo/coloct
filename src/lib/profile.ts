// ============================================================
// Profil du chercheur de colocation.
// Pour le MVP, on l'enregistre dans le navigateur (localStorage).
// Plus tard, il sera sauvegardé dans Supabase (le vrai serveur).
// ============================================================

export type Profile = {
  prenom: string;
  age: number;
  budgetMax: number; // budget mensuel maximum (€)
  quartiers: string[]; // quartiers préférés
  dateEmmenagement: string; // date d'emménagement souhaitée (AAAA-MM-JJ)
  nonFumeur: boolean;
  animaux: boolean; // a / veut des animaux
  teletravail: boolean; // télétravaille
};

const STORAGE_KEY = "colockt_profile";

// Enregistre le profil dans le navigateur
export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// Récupère le profil enregistré (ou null s'il n'y en a pas)
export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}
