"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, ChevronDown } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { reverseGeocode } from "@/lib/geo";
import { DEPARTEMENTS_NOMS } from "@/lib/profilOptions";

type Suggestion = { ville: string; departement: string; label: string };

// Tri des départements (Corse 2A/2B entre 19 et 21)
function cleDept(num: string): number {
  if (num === "2A") return 20.1;
  if (num === "2B") return 20.2;
  return parseInt(num, 10);
}
const DEPTS_DISPO = [...DEPARTEMENTS_NOMS].sort(
  (a, b) => cleDept(a.num) - cleDept(b.num)
);

// Communes embarquées (public/communes.json) pour le choix "dans la liste"
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

// Champ de recherche de localisation : on tape une ville (suggestions auto),
// ou "Autour de moi" (GPS), ou on déplie la liste département / ville.
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
  const [query, setQuery] = useState(ville || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [geoEnCours, setGeoEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [listeOuverte, setListeOuverte] = useState(false);
  const [villes, setVilles] = useState<string[]>([]);
  const [chargement, setChargement] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(ville || "");
  }, [ville]);

  // Suggestions au fil de la frappe (anti-rebond 250 ms)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            q
          )}&type=municipality&limit=6`
        );
        const d = await r.json();
        const sugg: Suggestion[] = (d.features ?? []).map(
          (f: {
            properties?: { city?: string; name?: string; context?: string };
          }) => {
            const p = f.properties ?? {};
            const nom = p.city || p.name || "";
            const dep = String(p.context || "").split(",")[0].trim();
            return { ville: nom, departement: dep, label: `${nom} (${dep})` };
          }
        );
        setSuggestions(sugg.filter((s) => s.ville));
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  // Communes du département choisi (pour la liste dépliable)
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

  // Ferme la liste de suggestions au clic / toucher en dehors
  useEffect(() => {
    function dehors(e: Event) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", dehors);
    document.addEventListener("touchstart", dehors);
    return () => {
      document.removeEventListener("mousedown", dehors);
      document.removeEventListener("touchstart", dehors);
    };
  }, []);

  function choisir(s: Suggestion) {
    onChange(s.ville, s.departement);
    setQuery(s.ville);
    setSuggestions([]);
    setOuvert(false);
    setErreur("");
  }

  async function autourDeMoi() {
    setErreur("");
    setGeoEnCours(true);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 12000,
      });
      const res = await reverseGeocode(
        pos.coords.latitude,
        pos.coords.longitude
      );
      if (res?.ville) {
        choisir({
          ville: res.ville,
          departement: res.departement,
          label: res.ville,
        });
      } else {
        setErreur("Impossible de trouver ta ville. Tape-la à la main.");
      }
    } catch {
      setErreur(
        "Localisation indisponible. Autorise la position, ou tape ta ville."
      );
    } finally {
      setGeoEnCours(false);
    }
  }

  const listeVilles =
    ville && !villes.includes(ville) ? [ville, ...villes] : villes;

  return (
    <div ref={boxRef} className="relative">
      {/* Champ de recherche */}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => setOuvert(true)}
          placeholder="Ajouter une localisation"
          autoCapitalize="words"
          autoComplete="off"
          className={(className || "") + " pl-9"}
        />
      </div>

      {/* Liste déroulante : Autour de moi + suggestions */}
      {ouvert && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-ink/10 bg-bg shadow-xl">
          <button
            type="button"
            onClick={autourDeMoi}
            disabled={geoEnCours}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-panel disabled:opacity-60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel">
              <LocateFixed className="h-4 w-4 text-bleu" />
            </span>
            <span className="font-medium text-ink">
              {geoEnCours ? "Localisation…" : "Autour de moi"}
            </span>
          </button>

          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => choisir(s)}
              className="flex w-full items-center gap-3 border-t border-ink/5 px-4 py-3 text-left transition-colors hover:bg-panel"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel">
                <MapPin className="h-4 w-4 text-ink/50" />
              </span>
              <span className="text-ink">{s.label}</span>
            </button>
          ))}

          {query.trim().length >= 2 && suggestions.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink/50">
              Continue à taper le nom de ta ville…
            </p>
          )}
        </div>
      )}

      {erreur && <p className="mt-1 text-xs text-pink-light">{erreur}</p>}

      {/* Choisir dans la liste (département / ville) */}
      <button
        type="button"
        onClick={() => setListeOuverte((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-bleu hover:underline"
      >
        <ChevronDown
          className={
            "h-3.5 w-3.5 transition-transform " +
            (listeOuverte ? "rotate-180" : "")
          }
        />
        Ou choisir dans la liste
      </button>

      {listeOuverte && (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Département
            </label>
            <select
              value={departement}
              onChange={(e) => onChange("", e.target.value)}
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
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Ville
            </label>
            <select
              value={ville}
              onChange={(e) => onChange(e.target.value, departement)}
              disabled={!departement || chargement}
              className={
                className + (!departement || chargement ? " opacity-50" : "")
              }
            >
              <option value="">
                {!departement
                  ? "Choisis d'abord un département"
                  : chargement
                    ? "Chargement…"
                    : "Choisir une ville…"}
              </option>
              {listeVilles.map((nom) => (
                <option key={nom} value={nom}>
                  {nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
