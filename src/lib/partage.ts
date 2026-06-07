import type { Listing } from "@/data/listings";
import { lieuComplet } from "./listings";

// Partage une annonce (partage natif ou copie du lien)
export async function partagerAnnonce(listing: Listing): Promise<void> {
  const lien = typeof window !== "undefined" ? window.location.origin : "";
  const texte = `Regarde cette coloc : ${lieuComplet(listing)} · ${listing.loyer} € / mois sur FlatMap !`;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "FlatMap", text: texte, url: lien });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${texte} ${lien}`);
    }
  } catch {
    /* partage annulé */
  }
}
