import { supabase } from "./supabase";
import type { Coloc, Listing } from "@/data/listings";
import { boostActif } from "./offers";

// Lieu d'une annonce, sous forme courte ("Paris 11e" ou "Saint-Denis (93)")
type Lieu = {
  quartier?: string | null;
  ville?: string | null;
  departement?: string | null;
  arrondissement?: number | null;
};
export function lieuSous(l: Lieu): string {
  if (l.arrondissement) return `Paris ${l.arrondissement}e`;
  if (l.departement) return `${l.ville ? l.ville + " " : ""}(${l.departement})`;
  return l.ville ?? "";
}
// Lieu complet ("Le Marais · Paris 4e")
export function lieuComplet(l: Lieu): string {
  const sous = lieuSous(l);
  if (l.quartier && sous) return `${l.quartier} · ${sous}`;
  return l.quartier || sous || "Colocation";
}

// Forme brute d'une ligne telle que stockée dans Supabase (colonnes en snake_case)
export type ListingRow = {
  id: number;
  loyer: number;
  quartier: string;
  ville: string | null;
  departement: string | null;
  arrondissement: number | null;
  date_dispo: string;
  dispo: string;
  surface: number;
  meuble: boolean;
  etage: string;
  colocs: Coloc[];
  criteres: string[];
  photos: string[];
  description: string;
  boosted_until: string | null;
};

// Convertit une ligne du serveur vers le format utilisé par l'app
export function mapListingRow(r: ListingRow): Listing {
  return {
    id: String(r.id),
    loyer: r.loyer,
    quartier: r.quartier,
    ville: r.ville,
    departement: r.departement,
    arrondissement: r.arrondissement,
    dateDispo: r.date_dispo,
    dispo: r.dispo,
    surface: r.surface,
    meuble: r.meuble,
    etage: r.etage,
    colocs: r.colocs ?? [],
    criteres: r.criteres ?? [],
    photos: r.photos ?? [],
    description: r.description,
    boosted_until: r.boosted_until,
  };
}

// Va chercher toutes les annonces dans la base de données Supabase
export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("id");

  if (error) throw error;
  return (data as ListingRow[])
    .map(mapListingRow)
    // Les annonces boostées passent en tête
    .sort((a, b) => (boostActif(b.boosted_until) ? 1 : 0) - (boostActif(a.boosted_until) ? 1 : 0));
}
