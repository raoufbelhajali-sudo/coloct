import type { Profile } from "./auth";
import type { Listing } from "@/data/listings";

function communs(a?: string[] | null, b?: string[] | null): string[] {
  const sb = new Set(b ?? []);
  return (a ?? []).filter((i) => sb.has(i));
}

// Points communs entre MON profil et un autre profil colocataire
export function compatProfils(moi: Profile | null, autre: Profile): string[] {
  if (!moi) return [];
  const pts = communs(moi.interets, autre.interets);
  if (moi.ambiance && moi.ambiance === autre.ambiance) pts.push(moi.ambiance);
  if (moi.rythme && moi.rythme === autre.rythme) pts.push(moi.rythme);
  // tranche d'âge recherchée
  if ((moi.age_min || moi.age_max) && autre.age) {
    const min = moi.age_min ?? 0;
    const max = moi.age_max ?? 200;
    if (autre.age >= min && autre.age <= max) pts.push("âge idéal");
  }
  return [...new Set(pts)];
}

// Points communs entre MON profil (colocataire) et une annonce
export function compatAnnonce(moi: Profile | null, l: Listing): string[] {
  if (!moi) return [];
  const txt = (l.colocs ?? [])
    .map((c) => c.ambiance)
    .join(" ")
    .toLowerCase();
  const pts: string[] = [];
  for (const i of moi.interets ?? []) {
    if (txt.includes(i.toLowerCase())) pts.push(i);
  }
  if (moi.ambiance) {
    const mot = moi.ambiance.toLowerCase().replace(/·e|·ère/g, "");
    if (mot && txt.includes(mot)) pts.push(moi.ambiance);
  }
  // tranche d'âge recherchée vs âges des colocs déjà sur place
  if (moi.age_min || moi.age_max) {
    const min = moi.age_min ?? 0;
    const max = moi.age_max ?? 200;
    if ((l.colocs ?? []).some((c) => c.age >= min && c.age <= max)) {
      pts.push("âge idéal");
    }
  }
  return [...new Set(pts)];
}
