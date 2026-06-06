"use client";

import { GRANDES_VILLES, DEPARTEMENTS_NOMS } from "@/lib/profilOptions";

// Liste des départements qui ont au moins une grande ville (numéro + nom),
// triés par numéro.
const DEPTS_DISPO = Array.from(new Set(GRANDES_VILLES.map((v) => v.dept)))
  .map((num) => ({
    num,
    nom: DEPARTEMENTS_NOMS.find((d) => d.num === num)?.nom ?? "",
  }))
  .sort((a, b) => a.num.localeCompare(b.num, "fr", { numeric: true }));

// Deux menus déroulants : on choisit d'abord le Département,
// puis la Ville (uniquement les villes de ce département).
export default function LieuSelect({
  ville,
  departement,
  onChange,
  className = "",
}: {
  ville: string;
  departement: string;
  onChange: (ville: string, departement: string) => void;
  className?: string;
}) {
  const villesDuDept = GRANDES_VILLES.filter((v) => v.dept === departement);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">
          Département
        </label>
        <select
          value={departement}
          onChange={(e) => {
            const nouveauDept = e.target.value;
            // On vide la ville : elle n'appartient plus forcément au département
            onChange("", nouveauDept);
          }}
          className={className}
        >
          <option value="">Choisir un département…</option>
          {DEPTS_DISPO.map((d) => (
            <option key={d.num} value={d.num}>
              {d.num} - {d.nom}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Ville</label>
        <select
          value={ville}
          onChange={(e) => onChange(e.target.value, departement)}
          disabled={!departement}
          className={className + (!departement ? " opacity-50" : "")}
        >
          <option value="">
            {departement ? "Choisir une ville…" : "Choisis d'abord un département"}
          </option>
          {villesDuDept.map((c) => (
            <option key={c.nom} value={c.nom}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
