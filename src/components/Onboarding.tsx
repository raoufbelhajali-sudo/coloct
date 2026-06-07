"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, KeyRound, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth, type Role } from "@/lib/auth";
import { listings } from "@/data/listings";
import { LogoMark } from "@/components/Logo";
import {
  INTERETS,
  AMBIANCES,
  RYTHMES,
  TABAC,
  ANIMAUX,
  TELETRAVAIL,
  SALAIRES,
  DUREES_COLOC,
} from "@/lib/profilOptions";
import LieuSelect from "@/components/LieuSelect";

const QUARTIERS = Array.from(new Set(listings.map((l) => l.quartier))).sort();
const GENRES = ["Femme", "Homme", "Autre"];

// Étapes du parcours selon le rôle
const ETAPES_COLOC = [
  "role", "prenom", "toi", "photo", "bio", "interets", "modevie", "recherche",
] as const;
const ETAPES_LOCA = ["role", "prenom", "photo"] as const;

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
  const [erreur, setErreur] = useState("");
  const [bienvenue, setBienvenue] = useState(false);
  const [intro, setIntro] = useState(true); // écran d'accueil avant le parcours

  // --- Champs du profil ---
  const [role, setRole] = useState<Role>("colocataire");
  const [prenom, setPrenom] = useState(prenomInitial);
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [genre, setGenre] = useState("");
  const [profession, setProfession] = useState("");
  const [salaire, setSalaire] = useState("");
  const [sansSalaire, setSansSalaire] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [bio, setBio] = useState("");
  const [interets, setInterets] = useState<string[]>([]);
  const [ambiance, setAmbiance] = useState<string[]>([]);
  const [rythme, setRythme] = useState<string[]>([]);
  const [tabac, setTabac] = useState(""); // "Non-fumeur" / "Fumeur" (obligatoire)
  const [animaux, setAnimaux] = useState(""); // ANIMAUX
  const [teletravail, setTeletravail] = useState(""); // TELETRAVAIL
  const [budgetMax, setBudgetMax] = useState(700);
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("99");
  const [ville, setVille] = useState("Paris");
  const [departement, setDepartement] = useState("75");
  const [parking, setParking] = useState(false);
  const [quartiers, setQuartiers] = useState<string[]>([]);
  const [dateEmm, setDateEmm] = useState("");
  const [dureeColoc, setDureeColoc] = useState("");

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
    if (etape === "toi") {
      if (!age.trim() || Number(age) <= 0) return false;
      if (!genre) return false;
    }
    if (etape === "interets" && interets.length < 3) return false;
    if (etape === "modevie") {
      // chaque choix doit être renseigné (au moins 3 ambiances et 3 rythmes)
      if (
        ambiance.length < 3 ||
        rythme.length < 3 ||
        !tabac ||
        !animaux ||
        !teletravail
      )
        return false;
    }
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
    setErreur("");
    if (besoinEmail && email.trim()) {
      await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        prenom: prenom.trim() || "Coloc",
        age: Number(age) || null,
        genre: genre || null,
        profession: profession.trim() || null,
        salaire: sansSalaire ? null : salaire || null,
        photo_url: photoUrl || null,
        bio: bio.trim() || null,
        interets,
        ambiance: ambiance.length ? ambiance : null,
        rythme: rythme.length ? rythme : null,
        non_fumeur: tabac === "Non-fumeur",
        animaux: animaux === "J'aime les animaux",
        teletravail: teletravail === "Je télétravaille",
        parking_souhaite: parking,
        budget_max: budgetMax,
        age_min: Number(ageMin) || null,
        age_max: Number(ageMax) || null,
        ville: ville.trim() || null,
        departement,
        quartiers,
        date_emmenagement: dateEmm || null,
        duree_coloc: dureeColoc || null,
      })
      .eq("id", user.id);
    if (error) {
      setEnCours(false);
      setErreur("L'enregistrement a échoué : " + error.message);
      return;
    }
    // NB : on NE rafraîchit PAS le profil ici, sinon la page parente
    // redirigerait aussitôt et l'écran de bienvenue disparaîtrait.
    setEnCours(false);
    setBienvenue(true); // écran de bienvenue (reste jusqu'au clic sur Continuer)
  }

  async function entrer() {
    await refreshProfile();
    router.replace(role === "locataire" ? "/locataire" : "/swipe");
  }

  // Écran d'accueil (tout début, juste après la connexion)
  if (intro) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <LogoMark className="mb-5 h-16 w-16" />
        <h1 className="font-display text-3xl font-semibold leading-tight">
          Bienvenue sur FlatSwiper !
        </h1>
        <p className="mt-3 max-w-sm text-ink/70">
          Prends quelques minutes pour <strong>bien remplir ton profil</strong>.
          Plus tu donnes d&apos;infos (mode de vie, centres d&apos;intérêt, ce que
          tu cherches…), plus tu trouveras <strong>facilement</strong> le
          logement ou le coloc idéal.
        </p>
        <button
          onClick={() => setIntro(false)}
          className="bg-signature glow-pink mt-8 rounded-full px-8 py-4 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          C&apos;est parti
        </button>
      </main>
    );
  }

  // Écran de bienvenue (fin d'inscription)
  if (bienvenue) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <LogoMark className="animate-logo-vibrate mb-5 h-16 w-16" />
        <h1 className="font-display text-3xl font-semibold leading-tight">
          Bienvenue{prenom.trim() ? ` ${prenom.trim()}` : ""} !
        </h1>
        <p className="mt-3 max-w-sm text-ink/70">
          {role === "locataire"
            ? "Ton profil est prêt. Complète ton annonce et découvre les colocataires intéressés par ton logement."
            : "Ton profil est prêt. Swipe les colocations qui te plaisent — un match, et la conversation commence !"}
        </p>
        <button
          onClick={entrer}
          className="bg-signature glow-pink mt-8 rounded-full px-8 py-4 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          {role === "locataire" ? "Créer mon annonce" : "Commencer à swiper"}
        </button>
      </main>
    );
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
                    sous="J'ai une chambre à partager (annonceur)"
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
                <label className="text-sm text-ink/70">
                  Âge <span className="text-pink">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className={champ}
                />
                <p className="mt-4 text-sm text-ink/70">
                  Genre <span className="text-pink">*</span>
                </p>
                <ChoixUnique
                  options={GENRES}
                  value={genre}
                  onChange={setGenre}
                  obligatoire
                />
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
                <div className="mt-4">
                  <label className="text-sm text-ink/70">
                    Tranche de salaire (net / mois)
                  </label>
                  {!sansSalaire && (
                    <select
                      value={salaire}
                      onChange={(e) => setSalaire(e.target.value)}
                      className={champ}
                    >
                      <option value="">Choisir une tranche…</option>
                      {SALAIRES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={sansSalaire}
                      onChange={(e) => setSansSalaire(e.target.checked)}
                      className="accent-pink h-4 w-4"
                    />
                    Je préfère ne pas indiquer mon salaire
                  </label>
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
                sous="Ajoutes-en un maximum : plus ton profil est complet, plus tu trouveras facilement un logement et des colocs compatibles !"
              >
                <ChoixMultiple
                  options={INTERETS}
                  values={interets}
                  onToggle={(v) => toggle(interets, setInterets, v)}
                />
                {interets.length < 3 && (
                  <p className="mt-3 text-xs text-pink">
                    Choisis au moins 3 centres d&apos;intérêt pour continuer ({interets.length}/3).
                  </p>
                )}
              </Etape>
            )}

            {/* ---------- Mode de vie ---------- */}
            {etape === "modevie" && (
              <Etape
                titre="Ton mode de vie"
                sous="Plus tu en dis sur toi, plus on te proposera des colocs qui te correspondent."
              >
                <p className="text-sm text-ink/70">
                  Ambiance <span className="text-pink">*</span>{" "}
                  <span className="text-ink/40">(au moins 3)</span>
                </p>
                <ChoixMultiple
                  options={AMBIANCES}
                  values={ambiance}
                  onToggle={(v) => toggle(ambiance, setAmbiance, v)}
                />
                {ambiance.length < 3 && (
                  <p className="mt-2 text-xs text-pink">
                    Choisis au moins 3 ambiances ({ambiance.length}/3).
                  </p>
                )}
                <p className="mt-4 text-sm text-ink/70">
                  Rythme <span className="text-pink">*</span>{" "}
                  <span className="text-ink/40">(au moins 3)</span>
                </p>
                <ChoixMultiple
                  options={RYTHMES}
                  values={rythme}
                  onToggle={(v) => toggle(rythme, setRythme, v)}
                />
                {rythme.length < 3 && (
                  <p className="mt-2 text-xs text-pink">
                    Choisis au moins 3 rythmes ({rythme.length}/3).
                  </p>
                )}
                <p className="mt-4 text-sm text-ink/70">
                  Tabac <span className="text-pink">*</span>
                </p>
                <ChoixUnique
                  options={TABAC}
                  value={tabac}
                  onChange={setTabac}
                  obligatoire
                />
                <p className="mt-4 text-sm text-ink/70">
                  Animaux <span className="text-pink">*</span>
                </p>
                <ChoixUnique
                  options={ANIMAUX}
                  value={animaux}
                  onChange={setAnimaux}
                  obligatoire
                />
                <p className="mt-4 text-sm text-ink/70">
                  Travail <span className="text-pink">*</span>
                </p>
                <ChoixUnique
                  options={TELETRAVAIL}
                  value={teletravail}
                  onChange={setTeletravail}
                  obligatoire
                />
                {!etapeValide() && (
                  <p className="mt-3 text-xs text-pink">
                    Merci de répondre à toutes les questions pour continuer.
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
                  Tranche d&apos;âge recherchée
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    className={champ + " w-20"}
                  />
                  <span className="text-ink/50">à</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    className={champ + " w-20"}
                  />
                  <span className="text-sm text-ink/50">ans</span>
                </div>
                <p className="mt-4 text-sm text-ink/70">Ville recherchée</p>
                <LieuSelect
                  ville={ville}
                  departement={departement}
                  onChange={(v, d) => {
                    setVille(v);
                    setDepartement(d);
                  }}
                  className={champ}
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
                <div className="mt-4">
                  <label className="text-sm text-ink/70">
                    Durée de colocation souhaitée
                  </label>
                  <select
                    value={dureeColoc}
                    onChange={(e) => setDureeColoc(e.target.value)}
                    className={champ}
                  >
                    <option value="">Choisir…</option>
                    {DUREES_COLOC.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={parking}
                    onChange={(e) => setParking(e.target.checked)}
                    className="accent-pink h-4 w-4"
                  />
                  Place de parking souhaitée
                </label>
              </Etape>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bouton continuer */}
      <div className="mx-auto w-full max-w-md">
        {erreur && (
          <p className="mb-3 rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">
            {erreur}
          </p>
        )}
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

