import type { Profile } from "./auth";
import type { Listing } from "@/data/listings";

// Score indicatif du poste occupé (proxy de revenu/stabilité) — pour le tri
// "meilleurs profils" réservé à l'annonceur boosté. Heuristique sur le métier.
const POSTES: { mots: string[]; score: number }[] = [
  { mots: ["médecin", "chirurgien", "avocat", "notaire", "pharmacien", "dentiste", "pilote"], score: 10 },
  { mots: ["ingénieur", "developpeur", "développeur", "data", "architecte", "consultant", "cadre", "manager", "directeur", "finance", "banque"], score: 8 },
  { mots: ["infirmier", "professeur", "enseignant", "designer", "comptable", "juriste", "commercial", "chef de projet", "fonctionnaire", "cdi"], score: 6 },
  { mots: ["technicien", "vendeur", "employé", "assistant", "serveur", "freelance", "indépendant"], score: 4 },
  { mots: ["stagiaire", "apprenti", "étudiant", "alternance", "sans emploi", "recherche"], score: 2 },
];

export function scoreProfession(p?: string | null): number {
  if (!p) return 0;
  const s = p.toLowerCase();
  for (const g of POSTES) if (g.mots.some((m) => s.includes(m))) return g.score;
  return 5; // métier non listé → score moyen
}

// Score selon la tranche de salaire déclarée (plus précis que le métier)
export function scoreSalaire(s?: string | null): number {
  switch (s) {
    case "Moins de 1 500 €": return 2;
    case "1 500 – 2 500 €": return 4;
    case "2 500 – 3 500 €": return 6;
    case "3 500 – 5 000 €": return 8;
    case "Plus de 5 000 €": return 10;
    default: return 0;
  }
}

// Score global d'un profil pour le classement "meilleurs profils" de l'annonceur :
// revenu (tranche de salaire si dispo, sinon poste) + points communs.
export function scoreProfilPourAnnonceur(
  annonceur: Profile | null,
  p: Profile
): number {
  const revenu = p.salaire ? scoreSalaire(p.salaire) : scoreProfession(p.profession);
  return revenu + compatProfils(annonceur, p).length * 4;
}

function communs(a?: string[] | null, b?: string[] | null): string[] {
  const sb = new Set(b ?? []);
  return (a ?? []).filter((i) => sb.has(i));
}

// Points communs entre MON profil et un autre profil colocataire
export function compatProfils(moi: Profile | null, autre: Profile): string[] {
  if (!moi) return [];
  const pts = communs(moi.interets, autre.interets);
  pts.push(...communs(moi.ambiance, autre.ambiance));
  pts.push(...communs(moi.rythme, autre.rythme));
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
  for (const amb of moi.ambiance ?? []) {
    const mot = amb.toLowerCase().replace(/·e|·ère/g, "");
    if (mot && txt.includes(mot)) pts.push(amb);
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
