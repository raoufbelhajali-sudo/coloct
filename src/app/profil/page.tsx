"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listings } from "@/data/listings";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

// Quartiers proposés (ceux des annonces disponibles)
const quartiers = Array.from(new Set(listings.map((l) => l.quartier))).sort();

export default function ProfilPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState("");
  const [budgetMax, setBudgetMax] = useState(700);
  const [quartiersChoisis, setQuartiersChoisis] = useState<string[]>([]);
  const [dateEmmenagement, setDateEmmenagement] = useState("");
  const [nonFumeur, setNonFumeur] = useState(false);
  const [animaux, setAnimaux] = useState(false);
  const [teletravail, setTeletravail] = useState(false);
  const [enCours, setEnCours] = useState(false);

  // Pas connecté → page de connexion
  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  // Pré-remplit avec le profil du serveur
  useEffect(() => {
    if (!profile) return;
    setPrenom(profile.prenom ?? "");
    setAge(profile.age ? String(profile.age) : "");
    if (profile.budget_max) setBudgetMax(profile.budget_max);
    setQuartiersChoisis(profile.quartiers ?? []);
    setDateEmmenagement(profile.date_emmenagement ?? "");
    setNonFumeur(profile.non_fumeur);
    setAnimaux(profile.animaux);
    setTeletravail(profile.teletravail);
  }, [profile]);

  function toggleQuartier(q: string) {
    setQuartiersChoisis((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setEnCours(true);
    await supabase
      .from("profiles")
      .update({
        prenom: prenom.trim(),
        age: Number(age) || null,
        budget_max: budgetMax,
        quartiers: quartiersChoisis,
        date_emmenagement: dateEmmenagement || null,
        non_fumeur: nonFumeur,
        animaux,
        teletravail,
      })
      .eq("id", user.id);
    await refreshProfile();
    setEnCours(false);
    router.push("/swipe");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <header className="mb-8 w-full max-w-md">
        <Link href="/swipe">
          <Logo markClass="h-7 w-7" textClass="text-xl" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold">Mes préférences</h1>
        <p className="mt-1 text-ink/60">
          Pour te proposer les colocs qui te correspondent.
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
          disabled={enCours}
          className="bg-signature glow-pink w-full rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {enCours ? "Enregistrement…" : "Enregistrer et swiper"}
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
