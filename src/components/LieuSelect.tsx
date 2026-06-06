"use client";

import { GRANDES_VILLES, DEPARTEMENTS_NOMS } from "@/lib/profilOptions";

// Deux menus déroulants : Ville (grandes villes, ordre alphabétique)
// + Département (avec son nom). Choisir une ville remplit son département.
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
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Ville</label>
        <select
          value={ville}
          onChange={(e) => {
            const v = e.target.value;
            const c = GRANDES_VILLES.find((x) => x.nom === v);
            onChange(v, c ? c.dept : departement);
          }}
          className={className}
        >
          <option value="">Choisir une ville…</option>
          {GRANDES_VILLES.map((c) => (
            <option key={c.nom} value={c.nom}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">
          Département
        </label>
        <select
          value={departement}
          onChange={(e) => onChange(ville, e.target.value)}
          className={className}
        >
          <option value="">Choisir un département…</option>
          {DEPARTEMENTS_NOMS.map((d) => (
            <option key={d.num} value={d.num}>
              {d.num} - {d.nom}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
