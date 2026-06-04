"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye } from "lucide-react";
import { listings } from "@/data/listings";
import { supabase } from "@/lib/supabase";
import { useAuth, type Profile } from "@/lib/auth";
import Logo from "@/components/Logo";
import ProfileDetail from "@/components/ProfileDetail";
import { INTERETS, AMBIANCES, RYTHMES, DEPARTEMENTS } from "@/lib/profilOptions";

const quartiers = Array.from(new Set(listings.map((l) => l.quartier))).sort();
const GENRES = ["Femme", "Homme", "Autre"];

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
  const [ville, setVille] = useState("Paris");
  const [departement, setDepartement] = useState("75");
  const [quartiersChoisis, setQuartiersChoisis] = useState<string[]>([]);
  const [dateEmmenagement, setDateEmmenagement] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [apercu, setApercu] = useState(false);

  const estLocataire = profile?.role === "locataire";
  const retour = estLocataire ? "/locataire" : "/swipe";

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  // Profil reconstruit à partir des champs en cours (pour l'aperçu)
  const profilApercu: Profile | null = profile
    ? {
        ...profile,
        prenom: prenom.trim() || profile.prenom,
        pseudo: pseudo.trim() || null,
        photo_url: photoUrl || null,
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
        budget_max: estLocataire ? null : budgetMax,
        quartiers: estLocataire ? [] : quartiersChoisis,
        date_emmenagement: estLocataire ? null : dateEmmenagement || null,
      }
    : null;

  // Téléverse une nouvelle photo de profil
  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoEnCours(true);
    const ext = file.name.split(".").pop() || "jpg";
    const chemin = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(chemin, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(chemin);
      setPhotoUrl(data.publicUrl);
      await supabase
        .from("profiles")
        .update({ photo_url: data.publicUrl })
        .eq("id", user.id);
      await refreshProfile();
    }
    setPhotoEnCours(false);
  }

  useEffect(() => {
    if (!profile) return;
    setPrenom(profile.prenom ?? "");
    setPseudo(profile.pseudo ?? "");
    setPhotoUrl(profile.photo_url ?? "");
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
    setVille(profile.ville ?? "Paris");
    setDepartement(profile.departement ?? "75");
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
        ville: ville.trim() || null,
        departement: departement || null,
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
        <Link href={retour}>
          <Logo markClass="h-7 w-7" textClass="text-xl" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setApercu(true)}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-panel px-3 py-1.5 text-sm text-ink/70 hover:border-pink hover:text-pink"
          >
            <Eye className="h-4 w-4" /> Voir mon profil
          </button>
          <Link href={retour} className="text-sm text-ink/60 hover:text-ink">
            Retour
          </Link>
        </div>
      </header>

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Mon profil</h1>
        <p className="mt-1 mb-6 text-ink/60">
          C&apos;est ce que les colocs verront avant de t&apos;accepter. Soigne-le !
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* ---------- Photo de profil ---------- */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-signature h-28 w-28 overflow-hidden rounded-full">
              {photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photoUrl}
                  alt="Ma photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-white/90">
                  {prenom.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-full border border-ink/15 bg-panel px-4 py-2 text-sm font-medium text-ink hover:border-ink/30">
              {photoEnCours ? "Envoi…" : photoUrl ? "Changer la photo" : "Ajouter une photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                disabled={photoEnCours}
                className="hidden"
              />
            </label>
          </div>

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

          {/* ---------- Recherche (colocataire uniquement) ---------- */}
          {!estLocataire && (
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-ink/70">Ville</label>
                  <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ex. Paris" className={champClasses} />
                </div>
                <div>
                  <label className="text-sm text-ink/70">Département</label>
                  <select value={departement} onChange={(e) => setDepartement(e.target.value)} className={champClasses}>
                    {DEPARTEMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <ChoixMultiple label="Quartiers qui m'intéressent" options={quartiers} values={quartiersChoisis} onToggle={(v) => toggle(quartiersChoisis, setQuartiersChoisis, v)} />
              <div>
                <label className="text-sm text-ink/70">Emménagement souhaité</label>
                <input type="date" value={dateEmmenagement} onChange={(e) => setDateEmmenagement(e.target.value)} className={champClasses} />
              </div>
            </Section>
          )}

          {/* ---------- Annonce (locataire uniquement) ---------- */}
          {estLocataire && (
            <Link
              href="/locataire"
              className="flex items-center justify-between rounded-2xl bg-panel px-4 py-4 text-ink/85 hover:bg-panel-2"
            >
              <span className="font-medium">Mon annonce (la chambre)</span>
              <span className="text-sm text-pink">Gérer →</span>
            </Link>
          )}

          {enregistre && (
            <p className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink">
              <Check className="h-4 w-4" strokeWidth={3} /> Profil enregistré !
            </p>
          )}

          <button type="submit" disabled={enCours}
            className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60">
            {enCours ? "Enregistrement…" : "Enregistrer mon profil"}
          </button>
        </form>
      </div>

      {/* Aperçu "Voir mon profil" */}
      {apercu && profilApercu && (
        <ProfileDetail
          profile={profilApercu}
          preview
          onClose={() => setApercu(false)}
        />
      )}
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
