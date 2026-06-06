"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = { ville: string; cp: string; dept: string };

// Champ "Ville ou code postal" avec autocomplétion (API Adresse data.gouv.fr).
// À la sélection : remplit la ville ET le département automatiquement.
export default function VilleInput({
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
  const [texte, setTexte] = useState(ville);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Si la valeur externe change (chargement du profil), on resynchronise le champ
  useEffect(() => {
    setTexte(ville);
  }, [ville]);

  function chercher(q: string) {
    if (timer.current) clearTimeout(timer.current);
    const v = q.trim();
    if (v.length < 1) {
      setSuggestions([]);
      setOuvert(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            v
          )}&type=municipality&autocomplete=1&limit=8`
        );
        const d = await r.json();
        const sugg: Suggestion[] = (d.features ?? []).map(
          (f: {
            properties: { name?: string; city?: string; postcode?: string; context?: string };
          }) => {
            const p = f.properties;
            const dept =
              (p.context || "").split(",")[0].trim() ||
              (p.postcode || "").slice(0, 2);
            return {
              ville: p.name || p.city || "",
              cp: p.postcode || "",
              dept,
            };
          }
        );
        // Code postal complet (5 chiffres) avec une seule commune → remplissage auto
        if (/^\d{5}$/.test(v) && sugg.length === 1) {
          choisir(sugg[0]);
          return;
        }
        setSuggestions(sugg);
        setOuvert(sugg.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }

  function choisir(s: Suggestion) {
    setTexte(s.ville);
    setSuggestions([]);
    setOuvert(false);
    onChange(s.ville, s.dept);
  }

  return (
    <div className="relative">
      <input
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
          onChange(e.target.value, departement); // texte libre, dépt inchangé
          chercher(e.target.value);
        }}
        onFocus={() => suggestions.length && setOuvert(true)}
        placeholder="Tape ton code postal (ex. 69003)"
        inputMode="text"
        autoComplete="off"
        className={className}
      />
      {departement ? (
        <p className="mt-1 text-xs text-ink/50">Département : {departement}</p>
      ) : (
        <p className="mt-1 text-xs text-ink/40">
          Tape le code postal : la ville se remplit toute seule (toute la France).
        </p>
      )}

      {ouvert && suggestions.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOuvert(false)} />
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-ink/10 bg-panel shadow-xl">
            {suggestions.map((s, i) => (
              <li key={`${s.cp}-${s.ville}-${i}`}>
                <button
                  type="button"
                  onClick={() => choisir(s)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-panel-2"
                >
                  <span className="font-semibold text-pink">{s.cp}</span>
                  <span className="text-ink/85">{s.ville}</span>
                  <span className="ml-auto text-xs text-ink/40">
                    ({s.dept})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
