import type { Listing } from "@/data/listings";
import { lieuComplet } from "./listings";
import { partagerLien } from "./share";

// Partage une annonce (feuille de partage native dans l'app, sinon web)
export async function partagerAnnonce(listing: Listing): Promise<void> {
  const texte = `Regarde cette coloc : ${lieuComplet(listing)} · ${listing.loyer} € / mois sur FlatSwiper !`;
  await partagerLien({
    title: "FlatSwiper",
    text: texte,
    url: "https://flatswiper.com",
  });
}
