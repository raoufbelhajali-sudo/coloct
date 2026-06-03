"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listings } from "@/data/listings";
import { saveProfile, loadProfile } from "@/lib/profile";

// Quartiers proposés (ceux des annonces disponibles)
const quartiers = Array.from(new Set(listings.map((l) => l.quartier))).sort();

export default function ProfilPage() {
  const router = useRouter();
  const existing = typeof window !== "undefined" ? loadProfile() : null;

  const [prenom, setPrenom] = useState(existing?.prenom ?? "");
  const [age, setAge] = useState(existing?.age?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(existing?.budgetMax ?? 700);
  const [quartiersChoisis, setQuartiersChoisis] = useState<string[]>(
    existing?.quartiers ?? []
  );
  const [dateEmmenagement, setDateEmmenagement] = useState(
    existing?.dateEmmenagement ?? ""
  );
  const [nonFumeur, setNonFumeur] = useState(existing?.nonFumeur ?? false);
  const [animaux, setAnimaux] = useState(existing?.animaux ?? false);
  const [teletravail, setTeletravail] = useState(existing?.teletravail ?? false);

  function toggleQuartier(q: string) {
    setQuartiersChoisis((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile({
      prenom: prenom.trim(),
      age: Number(age) || 0,
      budgetMax,
      quartiers: quartiersChoisis,
      dateEmmenagement,
      nonFumeur,
      animaux,
      teletravail,
    });
    router.push("/swipe");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <header className="mb-8 w-full max-w-md">
        <Link href="/" className="font-display text-2xl font-semibold">
          <span className="text-signature">Colock&apos;t</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold">Ton profil</h1>
        <p className="mt-1 text-ink/60">
          Quelques infos pour te proposer les meilleures colocs.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Prénom + âge */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="prenom" className="text-sm text-ink/70">
              Prénom
            </label>
            <input
              id="prenom"
              type="text"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ex. Camille"
              className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="age" className="text-sm text-ink/70">
              Âge
            </label>
            <input
              id="age"
              type="number"
              min={18}
              max={99}
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex. 25"
              className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
            />
          </div>
        </div>

        {/* Budget max */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="budget" className="text-ink/70">
              Budget max
            </label>
            <span className="font-semibold text-pink-light">{budgetMax} € / mois</span>
          </div>
          <input
            id="budget"
            type="range"
            min={400}
            max={1000}
            step={10}
            value={budgetMax}
            onChange={(e) => setBudgetMax(Number(e.target.value))}
            className="accent-pink mt-2 w-full"
          />
        </div>

        {/* Quartiers préférés */}
        <div>
          <p className="text-sm text-ink/70">Quartiers qui t&apos;intéressent</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quartiers.map((q) => {
              const actif = quartiersChoisis.includes(q);
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => toggleQuartier(q)}
                  className={
                    "rounded-full px-3 py-1.5 text-sm transition-colors " +
                    (actif
                      ? "bg-signature text-white"
                      : "bg-panel text-ink/70 hover:text-ink")
                  }
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date d'emménagement */}
        <div>
          <label htmlFor="date" className="text-sm text-ink/70">
            Emménagement souhaité
          </label>
          <input
            id="date"
            type="date"
            value={dateEmmenagement}
            onChange={(e) => setDateEmmenagement(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink focus:border-pink focus:outline-none"
          />
        </div>

        {/* Mode de vie */}
        <div>
          <p className="text-sm text-ink/70">Mode de vie</p>
          <div className="mt-2 space-y-2">
            <Checkbox label="Non-fumeur" checked={nonFumeur} onChange={setNonFumeur} />
            <Checkbox
              label="J'ai / j'aime les animaux"
              checked={animaux}
              onChange={setAnimaux}
            />
            <Checkbox
              label="Je télétravaille"
              checked={teletravail}
              onChange={setTeletravail}
            />
          </div>
        </div>

        {/* Bouton de validation */}
        <button
          type="submit"
          className="bg-signature glow-pink w-full rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          C&apos;est parti, je swipe !
        </button>
      </form>
    </main>
  );
}

// Petite case à cocher stylée
function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-panel px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-pink h-5 w-5"
      />
      <span className="text-ink/85">{label}</span>
    </label>
  );
}
