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

// Liste des communes EMBARQUÉE dans l'app (public/communes.json), groupée par
// département : { "69": ["Lyon", ...], ... }. Aucune dépendance à un serveur
// externe : le fichier est livré avec l'app (marche même hors-ligne).
// On le charge une seule fois et on le garde en cache.
type Communes = Record<string, string[]>;
let cache: Communes | null = null;
let promesse: Promise<Communes> | null = null;
function chargerCommunes(): Promise<Communes> {
  if (cache) return Promise.resolve(cache);
  if (!promesse) {
    promesse = fetch("/communes.json")
      .then((r) => r.json())
      .then((d: Communes) => {
        cache = d;
        return d;
      })
      .catch(() => ({}) as Communes);
  }
  return promesse;
}

// Deux menus déroulants : on choisit d'abord le Département,
// puis la Ville (toutes les communes du département).
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

  useEffect(() => {
    if (!departement) {
      setVilles([]);
      return;
    }
    let annule = false;
    setChargement(true);
    chargerCommunes().then((map) => {
      if (annule) return;
      setVilles(map[departement] ?? []);
      setChargement(false);
    });
    return () => {
      annule = true;
    };
  }, [departement]);

  // En édition, la ville déjà choisie peut ne pas être dans la liste chargée.
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
