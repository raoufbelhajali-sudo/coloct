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
  return l.quartier || sous || "Co/location";
}

// Forme brute d'une ligne telle que stockée dans Supabase (colonnes en snake_case)
export type ListingRow = {
  id: number;
  titre?: string | null;
  loyer: number;
  quartier: string;
  ville: string | null;
  departement: string | null;
  arrondissement: number | null;
  date_dispo: string;
  dispo: string;
  surface: number;
  nb_occupants: number | null;
  meuble: boolean;
  etage: string;
  colocs: Coloc[];
  criteres: string[];
  services: string[] | null;
  autres_frais: string | null;
  photos: string[];
  description: string;
  boosted_until: string | null;
  owner_id: string | null;
  lat: number | null;
  lng: number | null;
  gelee: boolean | null;
  statut_annonceur: string | null;
  type_logement: string | null;
  type_offre: string | null;
  nb_colocs_total: number | null;
  caution: number | null;
  salle_de_bain: string | null;
  duree_min_bail: string | null;
  genre_colocs: string | null;
};

// Convertit une ligne du serveur vers le format utilisé par l'app
export function mapListingRow(r: ListingRow): Listing {
  return {
    id: String(r.id),
    titre: r.titre ?? null,
    loyer: r.loyer,
    quartier: r.quartier,
    ville: r.ville,
    departement: r.departement,
    arrondissement: r.arrondissement,
    dateDispo: r.date_dispo,
    dispo: r.dispo,
    surface: r.surface,
    nbOccupants: r.nb_occupants,
    meuble: r.meuble,
    etage: r.etage,
    colocs: r.colocs ?? [],
    criteres: r.criteres ?? [],
    services: r.services ?? [],
    autresFrais: r.autres_frais,
    photos: r.photos ?? [],
    description: r.description,
    boosted_until: r.boosted_until,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    gelee: r.gelee ?? false,
    statutAnnonceur: r.statut_annonceur ?? null,
    typeLogement: r.type_logement ?? null,
    typeOffre: r.type_offre ?? "colocation",
    nbColocsTotal: r.nb_colocs_total ?? null,
    caution: r.caution ?? null,
    salleDeBain: r.salle_de_bain ?? null,
    dureeMinBail: r.duree_min_bail ?? null,
    genreColocs: r.genre_colocs ?? null,
  };
}

// Va chercher toutes les annonces dans la base de données Supabase
export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("id");

  if (error) throw error;
  const listings = (await attacherAnnonceurs((data as ListingRow[]) ?? []))
    // On ne montre pas les annonces gelées (bien déjà loué)
    .filter((l) => !l.gelee);

  // Les annonces boostées passent en tête
  return listings.sort(
    (a, b) =>
      (boostActif(b.boosted_until) ? 1 : 0) - (boostActif(a.boosted_until) ? 1 : 0)
  );
}

// Récupère une annonce par son id (avec l'annonceur rattaché)
export async function getListingById(
  id: number | string
): Promise<Listing | null> {
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) return null;
  const [l] = await attacherAnnonceurs([data as ListingRow]);
  return l ?? null;
}

// Convertit des lignes en annonces + rattache la photo/prénom de l'annonceur
export async function attacherAnnonceurs(
  rows: ListingRow[]
): Promise<Listing[]> {
  const listings = rows.map(mapListingRow);
  listings.forEach((l, i) => {
    l.ownerId = rows[i].owner_id;
  });
  const ownerIds = [...new Set(rows.map((r) => r.owner_id).filter(Boolean))];
  if (ownerIds.length) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, prenom, photo_url")
      .in("id", ownerIds as string[]);
    const byId = new Map((owners ?? []).map((o) => [o.id, o]));
    listings.forEach((l, i) => {
      const o = rows[i].owner_id ? byId.get(rows[i].owner_id!) : null;
      l.ownerPhoto = o?.photo_url ?? null;
      l.ownerPrenom = o?.prenom ?? null;
    });
  }
  return listings;
}
