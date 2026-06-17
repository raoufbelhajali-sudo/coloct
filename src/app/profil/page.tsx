"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, Star, ChevronDown, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth, type Profile } from "@/lib/auth";
import ProfileDetail from "@/components/ProfileDetail";
import PremiumPin from "@/components/PremiumPin";
import AppHeader from "@/components/AppHeader";
import LieuSelect from "@/components/LieuSelect";
import { INTERETS, AMBIANCES, RYTHMES, SALAIRES, PROMPTS, DUREES_COLOC, PROFESSIONS, LANGUES, NIVEAUX_SONORES, GENRES_COLOC_RECHERCHE } from "@/lib/profilOptions";
import { completudeProfil, estSuperProfil, labelSuper, champsManquantsSwipe } from "@/lib/completude";

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
  const [salaire, setSalaire] = useState("");
  const [sansSalaire, setSansSalaire] = useState(false);
  // À propos
  const [bio, setBio] = useState("");
  const [interets, setInterets] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  // Mode de vie
  const [ambiance, setAmbiance] = useState<string[]>([]);
  const [rythme, setRythme] = useState<string[]>([]);
  const [nonFumeur, setNonFumeur] = useState(false);
  const [animaux, setAnimaux] = useState(false);
  const [teletravail, setTeletravail] = useState(false);
  const [langues, setLangues] = useState<string[]>([]);
  const [niveauSonore, setNiveauSonore] = useState("");
  const [genreColocRecherche, setGenreColocRecherche] = useState("");
  // Recherche
  const [budgetMax, setBudgetMax] = useState(700);
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("99");
  const [ville, setVille] = useState("Paris");
  const [departement, setDepartement] = useState("75");
  const [parking, setParking] = useState(false);
  const [quartiersChoisis, setQuartiersChoisis] = useState<string[]>([]);
  const [dateEmmenagement, setDateEmmenagement] = useState("");
  const [dureeColoc, setDureeColoc] = useState("");
  // Agence (profil entreprise)
  const [siret, setSiret] = useState("");
  const [contactTel, setContactTel] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreurSave, setErreurSave] = useState("");
  const [apercu, setApercu] = useState(false);
  const [sectionCible, setSectionCible] = useState("");

  // Ouvre la 1re section incomplète et y défile
  function completer() {
    let cible = "";
    if (!photoUrl) cible = "bloc-photo";
    else if (!age || !genre || (!estLocataire && !profession.trim()))
      cible = "sec-identite";
    else if (!bio.trim() || interets.length < 3) cible = "sec-apropos";
    else if (ambiance.length < 3 || rythme.length < 3) cible = "sec-modevie";
    if (!cible) return;
    setSectionCible(cible);
    setTimeout(() => {
      document
        .getElementById(cible)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  const estLocataire = profile?.role === "locataire";
  const estAgence = profile?.est_agence ?? false;
  const retour = "/parametres"; // on arrive ici depuis les Réglages

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
        salaire: sansSalaire ? "Non communiqué" : salaire || null,
        bio: bio.trim() || null,
        interets,
        prompts,
        ambiance: ambiance.length ? ambiance : null,
        rythme: rythme.length ? rythme : null,
        non_fumeur: nonFumeur,
        langues,
        niveau_sonore: niveauSonore || null,
        genre_coloc_recherche: estLocataire ? null : genreColocRecherche || null,
        animaux,
        teletravail,
        budget_max: estLocataire ? null : budgetMax,
        quartiers: estLocataire ? [] : quartiersChoisis,
        date_emmenagement: estLocataire ? null : dateEmmenagement || null,
        duree_coloc: estLocataire ? null : dureeColoc || null,
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
    // "Non communiqué" = l'utilisateur a choisi de ne pas indiquer son salaire
    if (profile.salaire === "Non communiqué") {
      setSansSalaire(true);
      setSalaire("");
    } else {
      setSalaire(profile.salaire ?? "");
    }
    setBio(profile.bio ?? "");
    setInterets(profile.interets ?? []);
    setPrompts(profile.prompts ?? {});
    setAmbiance(profile.ambiance ?? []);
    setRythme(profile.rythme ?? []);
    setNonFumeur(profile.non_fumeur);
    setAnimaux(profile.animaux);
    setTeletravail(profile.teletravail);
    setLangues(profile.langues ?? []);
    setNiveauSonore(profile.niveau_sonore ?? "");
    setGenreColocRecherche(profile.genre_coloc_recherche ?? "");
    if (profile.budget_max) setBudgetMax(profile.budget_max);
    setAgeMin(profile.age_min ? String(profile.age_min) : "18");
    setAgeMax(profile.age_max ? String(profile.age_max) : "99");
    setVille(profile.ville ?? "Paris");
    setDepartement(profile.departement ?? "75");
    setParking(profile.parking_souhaite);
    setQuartiersChoisis(profile.quartiers ?? []);
    setDateEmmenagement(profile.date_emmenagement ?? "");
    setDureeColoc(profile.duree_coloc ?? "");
    setSiret(profile.siret ?? "");
    setContactTel(profile.contact_tel ?? "");
    setSiteWeb(profile.site_web ?? "");
  }, [profile]);

  function toggle(list: string[], set: (v: string[]) => void, val: string) {
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // --- Agence : on enregistre seulement les infos entreprise ---
    if (estAgence) {
      setEnCours(true);
      setEnregistre(false);
      setErreurSave("");
      const { error } = await supabase
        .from("profiles")
        .update({
          prenom: prenom.trim(),
          photo_url: photoUrl || null,
          siret: siret.trim() || null,
          contact_tel: contactTel.trim() || null,
          site_web: siteWeb.trim() || null,
          ville: ville.trim() || null,
          departement: departement || null,
        })
        .eq("id", user.id);
      setEnCours(false);
      if (error) {
        setErreurSave("L'enregistrement a échoué : " + error.message);
        return;
      }
      await refreshProfile();
      setEnregistre(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setEnregistre(false), 3500);
      return;
    }

    if (interets.length < 3 || ambiance.length < 3 || rythme.length < 3) {
      setErreurSave(
        "Choisis au moins 3 centres d'intérêt, 3 ambiances et 3 rythmes."
      );
      completer();
      return;
    }
    setEnCours(true);
    setEnregistre(false);
    setErreurSave("");
    const { error } = await supabase
      .from("profiles")
      .update({
        prenom: prenom.trim(),
        pseudo: pseudo.trim() || null,
        contact_tel: contactTel.trim() || null,
        age: Number(age) || null,
        genre: genre || null,
        profession: profession.trim() || null,
        salaire: sansSalaire ? "Non communiqué" : salaire || null,
        bio: bio.trim() || null,
        interets,
        prompts,
        ambiance: ambiance.length ? ambiance : null,
        rythme: rythme.length ? rythme : null,
        non_fumeur: nonFumeur,
        langues,
        niveau_sonore: niveauSonore || null,
        genre_coloc_recherche: estLocataire ? null : genreColocRecherche || null,
        animaux,
        teletravail,
        budget_max: budgetMax,
        age_min: Number(ageMin) || null,
        age_max: Number(ageMax) || null,
        ville: ville.trim() || null,
        departement: departement || null,
        parking_souhaite: parking,
        quartiers: quartiersChoisis,
        date_emmenagement: dateEmmenagement || null,
        duree_coloc: dureeColoc || null,
      })
      .eq("id", user.id);
    setEnCours(false);
    if (error) {
      setErreurSave("L'enregistrement a échoué : " + error.message);
      return;
    }
    await refreshProfile();
    setEnregistre(true);
    // Remonter en haut de la page pour voir la confirmation
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setEnregistre(false), 3500);
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-5">
      {/* Confirmation fixe en haut, visible après l'enregistrement */}
      {enregistre && (
        <div
          className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <Check className="h-4 w-4" strokeWidth={3} /> Profil enregistré !
        </div>
      )}
      <AppHeader />

      <div className="w-full max-w-md">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h1 className="font-display text-3xl font-bold">Mon profil</h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <PremiumPin />
            <button
              type="button"
              onClick={() => setApercu(true)}
              aria-label="Voir mon profil"
              title="Voir mon profil"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-bleu"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="mt-1 mb-4 text-ink/60">
          C&apos;est ce que les colocs verront avant de t&apos;accepter. Soigne-le !
        </p>

        {/* Profil incomplet (colocataire) → liste des champs obligatoires manquants */}
        {profile && profile.role !== "locataire" && champsManquantsSwipe(profile).length > 0 && (
          <div className="mb-5 rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/5 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-[#dc2626]">
              <AlertCircle className="h-4 w-4" /> Profil incomplet — tu ne pourras pas swiper
            </p>
            <p className="mt-1 text-ink/70">
              À compléter (obligatoire)&nbsp;:{" "}
              <span className="font-semibold text-[#dc2626]">
                {champsManquantsSwipe(profile).map((c) => c.label).join(", ")}
              </span>
            </p>
          </div>
        )}

        {/* Complétude du profil + badge Super (sans objet pour une agence) */}
        {profile && !estAgence && (
          <div className="mb-6 rounded-2xl bg-panel p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/70">Profil complété</span>
              <span className="font-semibold text-pink">
                {completudeProfil(profile)}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${completudeProfil(profile)}%`,
                  // Dégradé bleu clair → bleu, calé sur toute la jauge.
                  backgroundImage:
                    "linear-gradient(to right, #93c5fd, #2563eb)",
                  backgroundSize: `${
                    completudeProfil(profile) > 0
                      ? 10000 / completudeProfil(profile)
                      : 100
                  }% 100%`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>

            {estSuperProfil(profile) ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-pink">
                <Star className="h-4 w-4" fill="currentColor" /> Badge{" "}
                {labelSuper(profile)} débloqué !
              </p>
            ) : (
              <>
                <p className="mt-2 flex items-center gap-1 text-xs text-ink/50">
                  <Star className="h-3.5 w-3.5" /> Complète tout (photo,
                  présentation, intérêts, mode de vie…) pour débloquer le badge{" "}
                  {labelSuper(profile)}.
                </p>
                <button
                  type="button"
                  onClick={completer}
                  className="bg-signature mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  Compléter mon profil
                </button>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* ---------- Photo de profil ---------- */}
          <div id="bloc-photo" className="flex flex-col items-center gap-3">
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
            {estAgence ? (
              <p className="max-w-xs text-center text-xs text-ink/40">
                Le logo de ton agence (visible sur tes annonces et dans les
                messages).
              </p>
            ) : estLocataire ? (
              <p className="max-w-xs text-center text-xs text-ink/40">
                C&apos;est ta photo de profil (ton visage). Les photos de
                l&apos;appartement se gèrent dans ton annonce.
              </p>
            ) : null}
          </div>

          {/* ---------- Profil ENTREPRISE (agence) ---------- */}
          {estAgence && (
            <Section titre="Mon agence" defautOuvert>
              <div>
                <label className="text-sm text-ink/70">Nom de l&apos;agence</label>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex. Century 21 Paris 11e"
                  className={champClasses}
                />
              </div>
              <div className="mt-4">
                <label className="text-sm text-ink/70">SIRET</label>
                <input
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="Ex. 123 456 789 00012"
                  inputMode="numeric"
                  className={champClasses}
                />
              </div>
              <div className="mt-4">
                <label className="text-sm text-ink/70">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  value={contactTel}
                  onChange={(e) => setContactTel(e.target.value)}
                  placeholder="Ex. 01 23 45 67 89"
                  className={champClasses}
                />
              </div>
              <div className="mt-4">
                <label className="text-sm text-ink/70">Site web</label>
                <input
                  type="url"
                  value={siteWeb}
                  onChange={(e) => setSiteWeb(e.target.value)}
                  placeholder="Ex. www.mon-agence.fr"
                  autoCapitalize="none"
                  className={champClasses}
                />
              </div>
              <div className="mt-4">
                <label className="text-sm text-ink/70">Ville / secteur</label>
                <LieuSelect
                  ville={ville}
                  departement={departement}
                  onChange={(v, d) => {
                    setVille(v);
                    setDepartement(d);
                  }}
                  className={champClasses}
                />
              </div>
            </Section>
          )}

          {/* ---------- Sections personnelles (masquées pour les agences) ---------- */}
          {!estAgence && (
            <>
          {/* ---------- Identité ---------- */}
          <Section titre="Identité" defautOuvert id="sec-identite" forceOuvert={sectionCible === "sec-identite"}>
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Prénom" value={prenom} onChange={setPrenom} required placeholder="Camille" />
              <Champ label="Pseudo" value={pseudo} onChange={setPseudo} required placeholder="cam_paris" />
              <Champ label="Téléphone" type="tel" value={contactTel} onChange={setContactTel} required placeholder="06 12 34 56 78" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Âge" type="number" value={age} onChange={setAge} placeholder="25" />
              {!estLocataire && (
                <div>
                  <label className={"text-sm " + (!profession ? "font-semibold text-[#dc2626]" : "text-ink/70")}>
                    Situation pro{!profession ? " · obligatoire" : ""}
                  </label>
                  <select value={profession} onChange={(e) => setProfession(e.target.value)} className={champClasses}>
                    <option value="">Choisir…</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <ChoixUnique label="Genre" options={GENRES} value={genre} onChange={setGenre} required={!estLocataire} />
            {/* Salaire : colocataire (candidat) uniquement */}
            {!estLocataire && (
              <div>
                <label className={"text-sm " + (!salaire && !sansSalaire ? "font-semibold text-[#dc2626]" : "text-ink/70")}>
                  Tranche de salaire (net / mois){!salaire && !sansSalaire ? " · obligatoire" : ""}
                </label>
                {!sansSalaire && (
                  <select value={salaire} onChange={(e) => setSalaire(e.target.value)} className={champClasses}>
                    <option value="">Choisir une tranche…</option>
                    {SALAIRES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink/70">
                  <input type="checkbox" checked={sansSalaire} onChange={(e) => setSansSalaire(e.target.checked)} className="accent-pink h-4 w-4" />
                  Je préfère ne pas indiquer mon salaire
                </label>
              </div>
            )}
          </Section>

          {/* ---------- À propos ---------- */}
          <Section titre="À propos de moi" id="sec-apropos" forceOuvert={sectionCible === "sec-apropos"}>
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
            <ChoixMultiple label="Centres d'intérêt (au moins 3)" options={INTERETS} values={interets} onToggle={(v) => toggle(interets, setInterets, v)} min={3} />
            {interets.length < 3 ? (
              <p className="text-xs text-pink">Choisis au moins 3 centres d&apos;intérêt ({interets.length}/3).</p>
            ) : (
              <p className="text-xs text-ink/50">
                Ajoutes-en un maximum : ça t&apos;aide à trouver plus facilement un
                logement et des colocs compatibles.
              </p>
            )}

            {/* Prompts : réponses libres (facultatif) */}
            <div className="pt-2">
              <p className="text-sm font-medium text-ink/80">
                En quelques mots <span className="text-ink/40">(facultatif)</span>
              </p>
              <p className="mb-2 text-xs text-ink/50">
                Réponds à ce qui t&apos;inspire — ça rend ton profil plus vivant.
              </p>
              <div className="space-y-3">
                {PROMPTS.map((q) => (
                  <div key={q}>
                    <label className="text-xs text-ink/60">{q}</label>
                    <input
                      value={prompts[q] ?? ""}
                      onChange={(e) =>
                        setPrompts((p) => ({ ...p, [q]: e.target.value }))
                      }
                      placeholder="Ta réponse…"
                      maxLength={120}
                      className={champClasses}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ---------- Mode de vie ---------- */}
          <Section titre="Mode de vie" id="sec-modevie" forceOuvert={sectionCible === "sec-modevie"}>
            <p className="text-xs text-ink/50">
              Plus tu en sélectionnes, plus les colocs proposés te correspondront.
            </p>
            <ChoixMultiple label="Ambiance (au moins 3)" options={AMBIANCES} values={ambiance} onToggle={(v) => toggle(ambiance, setAmbiance, v)} min={3} />
            {ambiance.length < 3 && (
              <p className="text-xs text-pink">Choisis au moins 3 ambiances ({ambiance.length}/3).</p>
            )}
            <ChoixMultiple label="Rythme (au moins 3)" options={RYTHMES} values={rythme} onToggle={(v) => toggle(rythme, setRythme, v)} min={3} />
            {rythme.length < 3 && (
              <p className="text-xs text-pink">Choisis au moins 3 rythmes ({rythme.length}/3).</p>
            )}
            <div className="space-y-2">
              <Checkbox label="Non-fumeur" checked={nonFumeur} onChange={setNonFumeur} />
              <Checkbox label="J'ai / j'aime les animaux" checked={animaux} onChange={setAnimaux} />
              <Checkbox label="Je télétravaille" checked={teletravail} onChange={setTeletravail} />
            </div>
            <div>
              <label className="text-sm text-ink/70">Niveau sonore / soirées</label>
              <select value={niveauSonore} onChange={(e) => setNiveauSonore(e.target.value)} className={champClasses}>
                <option value="">Choisir…</option>
                {NIVEAUX_SONORES.map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            <ChoixMultiple label="Langues parlées" options={LANGUES} values={langues} onToggle={(v) => toggle(langues, setLangues, v)} />
          </Section>
            </>
          )}

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
              <div>
                <label className="text-sm text-ink/70">Tranche d&apos;âge recherchée</label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} className={champClasses + " w-20"} />
                  <span className="text-ink/50">à</span>
                  <input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} className={champClasses + " w-20"} />
                  <span className="text-sm text-ink/50">ans</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-ink/70">Ville recherchée</label>
                <LieuSelect
                  ville={ville}
                  departement={departement}
                  onChange={(v, d) => {
                    setVille(v);
                    setDepartement(d);
                  }}
                  className={champClasses}
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Emménagement souhaité</label>
                <input type="date" value={dateEmmenagement} onChange={(e) => setDateEmmenagement(e.target.value)} className={champClasses} />
              </div>
              <div>
                <label className="text-sm text-ink/70">Durée de co/location souhaitée</label>
                <select value={dureeColoc} onChange={(e) => setDureeColoc(e.target.value)} className={champClasses}>
                  <option value="">Choisir…</option>
                  {DUREES_COLOC.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-ink/70">Type de coloc recherché</label>
                <select value={genreColocRecherche} onChange={(e) => setGenreColocRecherche(e.target.value)} className={champClasses}>
                  <option value="">Choisir…</option>
                  {GENRES_COLOC_RECHERCHE.map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
              <Checkbox label="Place de parking souhaitée" checked={parking} onChange={setParking} />
            </Section>
          )}

          {/* ---------- Annonce (locataire uniquement) ---------- */}
          {estLocataire && (
            <Link
              href="/mon-annonce"
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
          {erreurSave && (
            <p className="rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">
              {erreurSave}
            </p>
          )}

          <button type="submit" disabled={enCours}
            className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60">
            {enCours
              ? "Enregistrement…"
              : estAgence
                ? "Enregistrer mon agence"
                : "Enregistrer mon profil"}
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

function Section({
  titre,
  children,
  defautOuvert = false,
  id,
  forceOuvert = false,
}: {
  titre: string;
  children: React.ReactNode;
  defautOuvert?: boolean;
  id?: string;
  forceOuvert?: boolean;
}) {
  const [ouvert, setOuvert] = useState(defautOuvert);
  useEffect(() => {
    if (forceOuvert) setOuvert(true);
  }, [forceOuvert]);
  return (
    <div id={id} className="rounded-2xl bg-panel">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="font-display text-lg font-semibold text-pink">
          {titre}
        </span>
        <ChevronDown
          className={
            "h-5 w-5 shrink-0 text-ink/50 transition-transform " +
            (ouvert ? "rotate-180" : "")
          }
        />
      </button>
      {ouvert && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}

function Champ({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  const manque = !!required && !value.trim();
  return (
    <div>
      <label className={"text-sm " + (manque ? "font-semibold text-[#dc2626]" : "text-ink/70")}>
        {label}{manque ? " · obligatoire" : ""}
      </label>
      <input type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={champClasses + (manque ? " ring-1 ring-[#dc2626]" : "")} />
    </div>
  );
}

function ChoixUnique({ label, options, value, onChange, required }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const manque = !!required && !value;
  return (
    <div>
      <p className={"text-sm " + (manque ? "font-semibold text-[#dc2626]" : "text-ink/70")}>
        {label}{manque ? " · obligatoire" : ""}
      </p>
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

function ChoixMultiple({ label, options, values, onToggle, min }: {
  label: string; options: string[]; values: string[]; onToggle: (v: string) => void; min?: number;
}) {
  const manque = !!min && values.length < min;
  return (
    <div>
      <p className={"text-sm " + (manque ? "font-semibold text-[#dc2626]" : "text-ink/70")}>
        {label}{manque ? " · obligatoire" : ""}
      </p>
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
