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
