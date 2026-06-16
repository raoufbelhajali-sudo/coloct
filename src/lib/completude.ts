import type { Profile } from "./auth";

// Pourcentage de complétude du profil (0–100), selon le rôle.
export function completudeProfil(p: Profile | null): number {
  if (!p) return 0;
  const base = [
    !!p.photo_url,
    !!p.age,
    !!p.genre,
    !!(p.bio && p.bio.trim()),
    !!(p.interets && p.interets.length >= 3),
    !!(p.ambiance && p.ambiance.length >= 3),
    !!(p.rythme && p.rythme.length >= 3),
  ];
  // Le colocataire a en plus la profession
  const champs =
    p.role === "locataire" ? base : [...base, !!p.profession];
  const remplis = champs.filter(Boolean).length;
  return Math.round((remplis / champs.length) * 100);
}

// Profil "Super" = 100 % rempli
export function estSuperProfil(p: Profile | null): boolean {
  return completudeProfil(p) === 100;
}

// Libellé du badge selon le rôle
export function labelSuper(p: Profile | null): string {
  return p?.role === "locataire" ? "Super annonceur" : "Super colocataire";
}

// --- Champs OBLIGATOIRES pour qu'un colocataire puisse swiper ---
export type ChampManquant = { cle: string; label: string };

export function champsManquantsSwipe(p: Profile | null): ChampManquant[] {
  if (!p) return [{ cle: "profil", label: "Ton profil" }];
  const m: ChampManquant[] = [];
  if (!(p.pseudo && p.pseudo.trim())) m.push({ cle: "pseudo", label: "Pseudo" });
  if (!(p.contact_tel && p.contact_tel.trim()))
    m.push({ cle: "tel", label: "Téléphone" });
  if (!p.photo_url) m.push({ cle: "photo", label: "Photo de profil" });
  if (!p.age) m.push({ cle: "age", label: "Âge" });
  if (!p.genre) m.push({ cle: "genre", label: "Genre" });
  if (!p.ville) m.push({ cle: "ville", label: "Ville recherchée" });
  if (!p.profession) m.push({ cle: "profession", label: "Situation pro" });
  if (!p.salaire) m.push({ cle: "salaire", label: "Tranche de salaire" });
  if (!(p.bio && p.bio.trim())) m.push({ cle: "bio", label: "Présentation" });
  if (!(p.interets && p.interets.length >= 3))
    m.push({ cle: "interets", label: "3 centres d'intérêt" });
  if (!(p.ambiance && p.ambiance.length >= 3))
    m.push({ cle: "ambiance", label: "3 ambiances" });
  if (!(p.rythme && p.rythme.length >= 3))
    m.push({ cle: "rythme", label: "3 rythmes" });
  return m;
}

// Le colocataire peut-il swiper ? (tous les champs obligatoires remplis)
export function profilPretASwiper(p: Profile | null): boolean {
  return champsManquantsSwipe(p).length === 0;
}
