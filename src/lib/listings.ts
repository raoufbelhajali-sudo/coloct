import { supabase } from "./supabase";
import type { Coloc, Listing } from "@/data/listings";

// Forme brute d'une ligne telle que stockée dans Supabase (colonnes en snake_case)
type ListingRow = {
  id: number;
  loyer: number;
  quartier: string;
  arrondissement: number;
  date_dispo: string;
  dispo: string;
  surface: number;
  meuble: boolean;
  etage: string;
  colocs: Coloc[];
  criteres: string[];
  photos: string[];
  description: string;
};

// Va chercher toutes les annonces dans la base de données Supabase
export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("id");

  if (error) throw error;

  // On convertit les colonnes du serveur vers le format utilisé par l'app
  return (data as ListingRow[]).map((r) => ({
    id: String(r.id),
    loyer: r.loyer,
    quartier: r.quartier,
    arrondissement: r.arrondissement,
    dateDispo: r.date_dispo,
    dispo: r.dispo,
    surface: r.surface,
    meuble: r.meuble,
    etage: r.etage,
    colocs: r.colocs,
    criteres: r.criteres,
    photos: r.photos,
    description: r.description,
  }));
}
