"use client";

import { useEffect, useState } from "react";
import { DEPARTEMENTS_NOMS } from "@/lib/profilOptions";

// Clé de tri : la Corse (2A/2B) se place entre le 19 et le 21
function cleDept(num: string): number {
  if (num === "2A") return 20.1;
  if (num === "2B") return 20.2;
  return parseInt(num, 10);
}

// Tous les départements (numéro + nom), triés par numéro.
const DEPTS_DISPO = [...DEPARTEMENTS_NOMS].sort(
  (a, b) => cleDept(a.num) - cleDept(b.num)
);

// Deux menus déroulants : on choisit d'abord le Département,
// puis la Ville. Les villes = TOUTES les communes du département,
// chargées depuis l'API officielle gratuite geo.api.gouv.fr.
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
  const [villes, setVilles] = useState<string[]>([]);
  const [chargement, setChargement] = useState(false);

  // Quand le département change, on récupère toutes ses communes.
  useEffect(() => {
    if (!departement) {
      setVilles([]);
      return;
    }
    let annule = false;
    setChargement(true);
    fetch(
      `https://geo.api.gouv.fr/departements/${departement}/communes?fields=nom&format=json`
    )
      .then((r) => r.json())
      .then((data: { nom: string }[]) => {
        if (annule) return;
        const noms = Array.isArray(data)
          ? data.map((c) => c.nom).sort((a, b) => a.localeCompare(b, "fr"))
          : [];
        setVilles(noms);
      })
      .catch(() => {
        if (!annule) setVilles([]);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [departement]);

  // En édition, la ville déjà choisie peut ne pas être (encore) dans la liste.
  const liste =
    ville && !villes.includes(ville) ? [ville, ...villes] : villes;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">
          Département
        </label>
        <select
          value={departement}
          onChange={(e) => {
            // On vide la ville : elle n'appartient plus au nouveau département
            onChange("", e.target.value);
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
          disabled={!departement || chargement}
          className={className + (!departement || chargement ? " opacity-50" : "")}
        >
          <option value="">
            {!departement
              ? "Choisis d'abord un département"
              : chargement
                ? "Chargement des villes…"
                : "Choisir une ville…"}
          </option>
          {liste.map((nom) => (
            <option key={nom} value={nom}>
              {nom}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
