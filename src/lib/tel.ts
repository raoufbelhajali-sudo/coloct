// Validation d'un numéro de téléphone FRANÇAIS (mobile ou fixe).
// Accepté : 10 chiffres commençant par 0 (ex. 06 12 34 56 78)
// ou format international +33 suivi de 9 chiffres (ex. +33 6 12 34 56 78).
export function telFrancaisValide(tel: string): boolean {
  const d = (tel || "").replace(/[^\d+]/g, "");
  return /^0[1-9]\d{8}$/.test(d) || /^\+33[1-9]\d{8}$/.test(d);
}
