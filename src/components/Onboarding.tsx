"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, KeyRound, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth, type Role } from "@/lib/auth";
import { listings } from "@/data/listings";
import {
  INTERETS,
  AMBIANCES,
  RYTHMES,
  TABAC,
  ANIMAUX,
  TELETRAVAIL,
} from "@/lib/profilOptions";

const QUARTIERS = Array.from(new Set(listings.map((l) => l.quartier))).sort();
const GENRES = ["Femme", "Homme", "Autre"];

// Étapes du parcours selon le rôle
const ETAPES_COLOC = [
  "role", "prenom", "toi", "photo", "bio", "interets", "modevie", "recherche",
] as const;
const ETAPES_LOCA = ["role", "prenom"] as const;

type EtapeColoc = (typeof ETAPES_COLOC)[number];

export default function Onboarding({
  prenomInitial = "",
  besoinEmail = false,
}: {
  prenomInitial?: string;
  besoinEmail?: boolean;
}) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [i, setI] = useState(0);
  const [sens, setSens] = useState(1); // 1 = avance, -1 = recule
  const [enCours, setEnCours] = useState(false);

  // --- Champs du profil ---
  const [role, setRole] = useState<Role>("colocataire");
  const [prenom, setPrenom] = useState(prenomInitial);
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [genre, setGenre] = useState("");
  const [profession, setProfession] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [bio, setBio] = useState("");
  const [interets, setInterets] = useState<string[]>([]);
  const [ambiance, setAmbiance] = useState("");
  const [rythme, setRythme] = useState("");
  const [tabac, setTabac] = useState(""); // "Non-fumeur" / "Fumeur" (obligatoire)
  const [animaux, setAnimaux] = useState(""); // ANIMAUX
  const [teletravail, setTeletravail] = useState(""); // TELETRAVAIL
  const [budgetMax, setBudgetMax] = useState(700);
  const [quartiers, setQuartiers] = useState<string[]>([]);
  const [dateEmm, setDateEmm] = useState("");

  const etapes: readonly string[] =
    role === "locataire" ? ETAPES_LOCA : ETAPES_COLOC;
  const etape = etapes[i] as EtapeColoc;
  const derniere = i === etapes.length - 1;
  const progression = Math.round(((i + 1) / etapes.length) * 100);

  function toggle(list: string[], set: (v: string[]) => void, val: string) {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  // Valide l'étape courante (sinon on n'avance pas)
  function etapeValide(): boolean {
    if (etape === "prenom") {
      if (!prenom.trim()) return false;
      if (besoinEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) return false;
    }
    if (etape === "modevie" && !tabac) return false; // fumeur/non-fumeur obligatoire
    return true;
  }

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
    }
    setPhotoEnCours(false);
  }

  function precedent() {
    if (i === 0) return;
    setSens(-1);
    setI((n) => n - 1);
  }

  async function suivant() {
    if (!etapeValide()) return;
    if (!derniere) {
      setSens(1);
      setI((n) => n + 1);
      return;
    }
    // Dernière étape → on enregistre tout
    await terminer();
  }

  async function terminer() {
    if (!user) return;
    setEnCours(true);
    if (besoinEmail && email.trim()) {
      await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    }
    await supabase
      .from("profiles")
      .update({
        role,
        prenom: prenom.trim() || "Coloc",
        age: Number(age) || null,
        genre: genre || null,
        profession: profession.trim() || null,
        photo_url: photoUrl || null,
        bio: bio.trim() || null,
        interets,
        ambiance: ambiance || null,
        rythme: rythme || null,
        non_fumeur: tabac === "Non-fumeur",
        animaux: animaux === "J'aime les animaux",
        teletravail: teletravail === "Je télétravaille",
        budget_max: budgetMax,
        quartiers,
        date_emmenagement: dateEmm || null,
      })
      .eq("id", user.id);
    await refreshProfile();
    router.replace(role === "locataire" ? "/locataire" : "/swipe");
  }

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-6 pt-5">
      {/* Barre de progression + retour */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3">
        {i > 0 ? (
          <button
            onClick={precedent}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-panel"
            aria-label="Précédent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-8 w-8 shrink-0" />
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel-2">
          <div
            className="bg-signature h-full rounded-full transition-all duration-300"
            style={{ width: `${progression}%` }}
          />
        </div>
        <span className="w-12 shrink-0 text-right text-xs text-ink/50">
          {i + 1}/{etapes.length}
        </span>
      </div>

      {/* Contenu de l'étape (animé) */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
        <AnimatePresence mode="wait" custom={sens}>
          <motion.div
            key={etape}
            custom={sens}
            initial={{ opacity: 0, x: sens * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: sens * -40 }}
            transition={{ duration: 0.22 }}
            className="flex flex-1 flex-col"
          >
            {/* ---------- Rôle ---------- */}
            {etape === "role" && (
              <Etape
                titre="Tu es là pour…"
                sous="On adapte tout le reste à ton objectif."
              >
                <div className="grid grid-cols-1 gap-3">
                  <CarteRole
                    titre="Chercher une chambre"
                    sous="Je veux trouver une coloc (colocataire)"
                    icon={<Telescope className="h-7 w-7 text-pink" />}
                    actif={role === "colocataire"}
                    onClick={() => setRole("colocataire")}
                  />
                  <CarteRole
                    titre="Proposer mon logement"
                    sous="J'ai une chambre à partager (locataire)"
                    icon={<KeyRound className="h-7 w-7 text-violet" />}
                    actif={role === "locataire"}
                    onClick={() => setRole("locataire")}
                  />
                </div>
              </Etape>
            )}

            {/* ---------- Prénom (+ email si tél) ---------- */}
            {etape === "prenom" && (
              <Etape
                titre="Comment tu t'appelles ?"
                sous="C'est le prénom que les autres verront."
              >
                <input
                  autoFocus
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex. Camille"
                  className={champ}
                />
                {besoinEmail && (
                  <div className="mt-4">
                    <label className="text-sm text-ink/70">Ton email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="toi@email.com"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={champ}
                    />
                  </div>
                )}
              </Etape>
            )}

            {/* ---------- Toi en bref ---------- */}
            {etape === "toi" && (
              <Etape titre="Parle-nous de toi" sous="Quelques infos rapides.">
                <label className="text-sm text-ink/70">Âge</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className={champ}
                />
                <p className="mt-4 text-sm text-ink/70">Genre</p>
                <ChoixUnique options={GENRES} value={genre} onChange={setGenre} />
                <div className="mt-4">
                  <label className="text-sm text-ink/70">
                    Profession / statut
                  </label>
                  <input
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Étudiante, Designer…"
                    className={champ}
                  />
                </div>
              </Etape>
            )}

            {/* ---------- Photo ---------- */}
            {etape === "photo" && (
              <Etape
                titre="Ajoute une photo"
                sous="Les profils avec photo ont beaucoup plus de matchs."
              >
                <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="bg-signature h-36 w-36 overflow-hidden rounded-full">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt="Ma photo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-6xl font-bold text-white/90">
                        {prenom.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-full border border-ink/15 bg-panel px-5 py-2.5 text-sm font-medium text-ink hover:border-ink/30">
                    {photoEnCours
                      ? "Envoi…"
                      : photoUrl
                        ? "Changer la photo"
                        : "Choisir une photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      disabled={photoEnCours}
                      className="hidden"
                    />
                  </label>
                </div>
              </Etape>
            )}

            {/* ---------- Bio ---------- */}
            {etape === "bio" && (
              <Etape
                titre="Décris-toi en quelques mots"
                sous="Ton mode de vie, ce que tu cherches dans une coloc…"
              >
                <textarea
                  autoFocus
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Ex. Étudiante en archi, plutôt calme en semaine et sociable le week-end. Je cherche une coloc bienveillante près des transports."
                  className={champ}
                />
              </Etape>
            )}

            {/* ---------- Centres d'intérêt ---------- */}
            {etape === "interets" && (
              <Etape
                titre="Tes centres d'intérêt"
                sous="Choisis ce qui te ressemble (autant que tu veux)."
              >
                <ChoixMultiple
                  options={INTERETS}
                  values={interets}
                  onToggle={(v) => toggle(interets, setInterets, v)}
                />
              </Etape>
            )}

            {/* ---------- Mode de vie ---------- */}
            {etape === "modevie" && (
              <Etape titre="Ton mode de vie" sous="Pour trouver les bons colocs.">
                <p className="text-sm text-ink/70">Ambiance</p>
                <ChoixUnique
                  options={AMBIANCES}
                  value={ambiance}
                  onChange={setAmbiance}
                />
                <p className="mt-4 text-sm text-ink/70">Rythme</p>
                <ChoixUnique
                  options={RYTHMES}
                  value={rythme}
                  onChange={setRythme}
                />
                <p className="mt-4 text-sm text-ink/70">
                  Tabac <span className="text-pink">*</span>
                </p>
                <ChoixUnique
                  options={TABAC}
                  value={tabac}
                  onChange={setTabac}
                  obligatoire
                />
                <p className="mt-4 text-sm text-ink/70">Animaux</p>
                <ChoixUnique
                  options={ANIMAUX}
                  value={animaux}
                  onChange={setAnimaux}
                />
                <p className="mt-4 text-sm text-ink/70">Travail</p>
                <ChoixUnique
                  options={TELETRAVAIL}
                  value={teletravail}
                  onChange={setTeletravail}
                />
                {!tabac && (
                  <p className="mt-3 text-xs text-pink">
                    Merci d&apos;indiquer si tu es fumeur ou non pour continuer.
                  </p>
                )}
              </Etape>
            )}

            {/* ---------- Recherche ---------- */}
            {etape === "recherche" && (
              <Etape
                titre="Ce que tu cherches"
                sous="On te montrera les colocs qui collent."
              >
                <div className="flex items-center justify-between text-sm">
                  <label className="text-ink/70">Budget max</label>
                  <span className="font-semibold text-pink">
                    {budgetMax} € / mois
                  </span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={1000}
                  step={10}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="accent-pink mt-2 w-full"
                />
                <p className="mt-4 text-sm text-ink/70">
                  Quartiers qui m&apos;intéressent
                </p>
                <ChoixMultiple
                  options={QUARTIERS}
                  values={quartiers}
                  onToggle={(v) => toggle(quartiers, setQuartiers, v)}
                />
                <div className="mt-4">
                  <label className="text-sm text-ink/70">
                    Emménagement souhaité
                  </label>
                  <input
                    type="date"
                    value={dateEmm}
                    onChange={(e) => setDateEmm(e.target.value)}
                    className={champ}
                  />
                </div>
              </Etape>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bouton continuer */}
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={suivant}
          disabled={!etapeValide() || enCours}
          className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {enCours
            ? "Un instant…"
            : derniere
              ? "Terminer mon profil"
              : "Continuer"}
        </button>
      </div>
    </main>
  );
}

/* ---------------- Sous-composants ---------------- */

const champ =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";

function Etape({
  titre,
  sous,
  children,
}: {
  titre: string;
  sous?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-display text-3xl font-semibold leading-tight">
        {titre}
      </h1>
      {sous && <p className="mt-2 mb-6 text-ink/60">{sous}</p>}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CarteRole({
  titre,
  sous,
  icon,
  actif,
  onClick,
}: {
  titre: string;
  sous: string;
  icon: React.ReactNode;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all " +
        (actif
          ? "border-pink bg-pink/10 shadow-md"
          : "border-ink/10 bg-panel hover:border-ink/30")
      }
    >
      {icon}
      <div>
        <div className={"font-semibold " + (actif ? "text-pink" : "")}>
          {titre}
        </div>
        <div className="text-sm text-ink/60">{sous}</div>
      </div>
      {actif && (
        <span className="bg-signature absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function ChoixUnique({
  options,
  value,
  onChange,
  obligatoire = false,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  obligatoire?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const actif = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(actif && !obligatoire ? "" : o)}
            className={
              "rounded-full px-4 py-2 text-sm transition-colors " +
              (actif
                ? "bg-signature text-white"
                : "bg-panel text-ink/70 hover:text-ink")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ChoixMultiple({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const actif = values.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={
              "rounded-full px-4 py-2 text-sm transition-colors " +
              (actif
                ? "bg-signature text-white"
                : "bg-panel text-ink/70 hover:text-ink")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

