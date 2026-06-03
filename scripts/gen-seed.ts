// Génère le script SQL d'insertion des annonces à partir de src/data/listings.ts
import { listings } from "../src/data/listings.ts";

function esc(s: string): string {
  return s.replace(/'/g, "''"); // échappe les apostrophes pour le SQL
}
function textArray(a: string[]): string {
  return `ARRAY[${a.map((x) => `'${esc(x)}'`).join(", ")}]`;
}

const rows = listings.map((l) => {
  const colocs = esc(JSON.stringify(l.colocs));
  return `  (${l.loyer}, '${esc(l.quartier)}', ${l.arrondissement}, '${esc(
    l.dateDispo
  )}', '${l.dispo}', ${l.surface}, ${l.meuble}, '${esc(
    l.etage
  )}', '${colocs}'::jsonb, ${textArray(l.criteres)}, ${textArray(
    l.photos
  )}, '${esc(l.description)}')`;
});

const sql = `insert into public.listings
  (loyer, quartier, arrondissement, date_dispo, dispo, surface, meuble, etage, colocs, criteres, photos, description)
values
${rows.join(",\n")};`;

console.log(sql);
