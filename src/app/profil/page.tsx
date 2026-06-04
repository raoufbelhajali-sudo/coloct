"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listings } from "@/data/listings";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

const quartiers = Array.from(new Set(listings.map((l) => l.quartier))).sort();
const INTERETS = [
  "Sport", "Musique", "Cuisine", "Cinéma", "Jeux vidéo", "Voyages",
  "Lecture", "Sorties", "Art", "Nature", "Photo", "Yoga",
];
const GENRES = ["Femme", "Homme", "Autre"];
const AMBIANCES = ["Calme", "Sociable", "Fêtard·e"];
const RYTHMES = ["Matinal·e", "Noctambule", "Flexible"];

export default function ProfilPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Identité
  const [prenom, setPrenom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [age, setAge] = useState("");
  const [genre, setGenre] = useState("");
  const [profession, setProfession] = useState("");
  // À propos
  const [bio, setBio] = useState("");
  const [interets, setInterets] = useState<string[]>([]);
  // Mode de vie
  const [ambiance, setAmbiance] = useState("");
  const [rythme, setRythme] = useState("");
  const [nonFumeur, setNonFumeur] = useState(false);
  const [animaux, setAnimaux] = useState(false);
  const [teletravail, setTeletravail] = useState(false);
  // Recherche
  const [budgetMax, setBudgetMax] = useState(700);
  const [quartiersChoisis, setQuartiersChoisis] = useState<string[]>([]);
  const [dateEmmenagement, setDateEmmenagement] = useState("");

  const [enCours, setEnCours] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  useEffect(() => {
    if (!profile) return;
    setPrenom(profile.prenom ?? "");
    setPseudo(profile.pseudo ?? "");
    setAge(profile.age ? String(profile.age) : "");
    setGenre(profile.genre ?? "");
    setProfession(profile.profession ?? "");
    setBio(profile.bio ?? "");
    setInterets(profile.interets ?? []);
    setAmbiance(profile.ambiance ?? "");
    setRythme(profile.rythme ?? "");
    setNonFumeur(profile.non_fumeur);
    setAnimaux(profile.animaux);
    setTeletravail(profile.teletravail);
    if (profile.budget_max) setBudgetMax(profile.budget_max);
    setQuartiersChoisis(profile.quartiers ?? []);
    setDateEmmenagement(profile.date_emmenagement ?? "");
  }, [profile]);

  function toggle(list: string[], set: (v: string[]) => void, val: string) {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setEnCours(true);
    setEnregistre(false);
    await supabase
      .from("profiles")
      .update({
        prenom: prenom.trim(),
        pseudo: pseudo.trim() || null,
        age: Number(age) || null,
        genre: genre || null,
        profession: profession.trim() || null,
        bio: bio.trim() || null,
        interets,
        ambiance: ambiance || null,
        rythme: rythme || null,
        non_fumeur: nonFumeur,
        animaux,
        teletravail,
        budget_max: budgetMax,
        quartiers: quartiersChoisis,
        date_emmenagement: dateEmmenagement || null,
      })
      .eq("id", user.id);
    await refreshProfile();
    setEnCours(false);
    setEnregistre(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <header className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link href="/swipe">
          <Logo markClass="h-7 w-7" textClass="text-xl" />
        </Link>
        <Link href="/swipe" className="text-sm text-ink/60 hover:text-ink">
          Retour au swipe
        </Link>
      </header>

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Mon profil</h1>
        <p className="mt-1 mb-6 text-ink/60">
          C&apos;est ce que les colocs verront avant de t&apos;accepter. Soigne-le !
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* ---------- Identité ---------- */}
          <Section titre="Identité">
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Prénom" value={prenom} onChange={setPrenom} required placeholder="Camille" />
              <Champ label="Pseudo" value={pseudo} onChange={setPseudo} placeholder="cam_paris" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Âge" type="number" value={age} onChange={setAge} placeholder="25" />
              <Champ label="Profession / statut" value={profession} onChange={setProfession} placeholder="Étudiante, Designer…" />
            </div>
            <ChoixUnique label="Genre" options={GENRES} value={genre} onChange={setGenre} />
          </Section>

          {/* ---------- À propos ---------- */}
          <Section titre="À propos de moi">
            <div>
              <label className="text-sm text-ink/70">Présentation</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Quelques mots sur toi, ton mode de vie, ce que tu cherches dans une coloc…"
                className={champClasses}
              />
            </div>
            <ChoixMultiple label="Centres d'intérêt" options={INTERETS} values={interets} onToggle={(v) => toggle(interets, setInterets, v)} />
          </Section>

          {/* ---------- Mode de vie ---------- */}
          <Section titre="Mode de vie">
            <ChoixUnique label="Ambiance" options={AMBIANCES} value={ambiance} onChange={setAmbiance} />
            <ChoixUnique label="Rythme" options={RYTHMES} value={rythme} onChange={setRythme} />
            <div className="space-y-2">
              <Checkbox label="Non-fumeur" checked={nonFumeur} onChange={setNonFumeur} />
              <Checkbox label="J'ai / j'aime les animaux" checked={animaux} onChange={setAnimaux} />
              <Checkbox label="Je télétravaille" checked={teletravail} onChange={setTeletravail} />
            </div>
          </Section>

          {/* ---------- Recherche ---------- */}
          <Section titre="Ce que je cherche">
            <div>
              <div className="flex items-center justify-between text-sm">
                <label className="text-ink/70">Budget max</label>
                <span className="font-semibold text-pink">{budgetMax} € / mois</span>
              </div>
              <input type="range" min={400} max={1000} step={10} value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="accent-pink mt-2 w-full" />
            </div>
            <ChoixMultiple label="Quartiers qui m'intéressent" options={quartiers} values={quartiersChoisis} onToggle={(v) => toggle(quartiersChoisis, setQuartiersChoisis, v)} />
            <div>
              <label className="text-sm text-ink/70">Emménagement souhaité</label>
              <input type="date" value={dateEmmenagement} onChange={(e) => setDateEmmenagement(e.target.value)} className={champClasses} />
            </div>
          </Section>

          {enregistre && (
            <p className="rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink">
              ✓ Profil enregistré !
            </p>
          )}

          <button type="submit" disabled={enCours}
            className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60">
            {enCours ? "Enregistrement…" : "Enregistrer mon profil"}
          </button>
        </form>
      </div>
    </main>
  );
}

const champClasses =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-pink">{titre}</h2>
      {children}
    </div>
  );
}

function Champ({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-ink/70">{label}</label>
      <input type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={champClasses} />
    </div>
  );
}

function ChoixUnique({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink/70">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const actif = value === o;
          return (
            <button key={o} type="button" onClick={() => onChange(actif ? "" : o)}
              className={"rounded-full px-4 py-1.5 text-sm transition-colors " +
                (actif ? "bg-signature text-white" : "bg-panel text-ink/70 hover:text-ink")}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoixMultiple({ label, options, values, onToggle }: {
  label: string; options: string[]; values: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink/70">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const actif = values.includes(o);
          return (
            <button key={o} type="button" onClick={() => onToggle(o)}
              className={"rounded-full px-3 py-1.5 text-sm transition-colors " +
                (actif ? "bg-signature text-white" : "bg-panel text-ink/70 hover:text-ink")}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-panel px-3 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-pink h-5 w-5" />
      <span className="text-ink/85">{label}</span>
    </label>
  );
}
