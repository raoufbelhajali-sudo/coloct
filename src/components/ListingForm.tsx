"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createListing, updateListing } from "@/lib/locataire";
import type { Listing } from "@/data/listings";
import LieuSelect from "@/components/LieuSelect";
import {
  SERVICES,
  STATUTS_ANNONCEUR,
  TYPES_LOGEMENT,
  SALLES_DE_BAIN,
  DUREES_MIN_BAIL,
  GENRES_COLOC,
} from "@/lib/profilOptions";
import { geocodeVille } from "@/lib/geo";

const PHOTO_PAR_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

const CRITERES_POSSIBLES = [
  "Non-fumeur",
  "Animaux bienvenus",
  "Télétravail friendly",
  "Soirées OK",
  "Calme",
];

// Formulaire de création / modification de l'annonce (le bien) du locataire.
// Si `listing` est fourni → mode modification (champs pré-remplis).
export default function ListingForm({
  onCreated,
  listing,
}: {
  onCreated: () => void;
  listing?: Listing;
}) {
  const { user, profile } = useAuth();
  const edition = !!listing;

  const [titre, setTitre] = useState(listing?.titre ?? "");
  const [ville, setVille] = useState(listing?.ville ?? "Paris");
  const [departement, setDepartement] = useState(listing?.departement ?? "75");
  const [loyer, setLoyer] = useState(listing ? String(listing.loyer) : "");
  const [surface, setSurface] = useState(listing ? String(listing.surface) : "");
  const [meuble, setMeuble] = useState(listing?.meuble ?? true);
  const [statutAnnonceur, setStatutAnnonceur] = useState(
    listing?.statutAnnonceur ?? ""
  );
  const [typeLogement, setTypeLogement] = useState(listing?.typeLogement ?? "");
  const [nbColocsTotal, setNbColocsTotal] = useState(
    listing?.nbColocsTotal ? String(listing.nbColocsTotal) : ""
  );
  const [caution, setCaution] = useState(
    listing?.caution ? String(listing.caution) : ""
  );
  const [salleDeBain, setSalleDeBain] = useState(listing?.salleDeBain ?? "");
  const [dureeMinBail, setDureeMinBail] = useState(listing?.dureeMinBail ?? "");
  const [genreColocs, setGenreColocs] = useState(listing?.genreColocs ?? "");
  const [etage, setEtage] = useState(listing?.etage ?? "");
  const [dispo, setDispo] = useState(listing?.dispo ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const [criteres, setCriteres] = useState<string[]>(
    listing?.criteres ?? ["Non-fumeur"]
  );
  const [services, setServices] = useState<string[]>(listing?.services ?? []);
  const [autresFrais, setAutresFrais] = useState(listing?.autresFrais ?? "");

  function toggleService(s: string) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  // Téléverse une ou plusieurs photos depuis le téléphone (bucket avatars,
  // dossier de l'utilisateur → autorisé par les règles existantes)
  async function ajouterPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !user) return;
    setPhotoEnCours(true);
    setErreur("");
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const chemin = `${user.id}/listing-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(chemin, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(chemin);
        setPhotos((prev) => [...prev, data.publicUrl]);
      } else {
        setErreur("Une photo n'a pas pu être envoyée. Réessaie.");
      }
    }
    setPhotoEnCours(false);
    e.target.value = ""; // permet de re-sélectionner la même photo
  }

  function retirerPhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  function toggleCritere(c: string) {
    setCriteres((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErreur("");
    if (photos.length < 5) {
      setErreur(
        `Ajoute au moins 5 photos : la chambre proposée, la cuisine, les WC / salle de bain et les pièces communes (${photos.length}/5).`
      );
      return;
    }
    setEnCours(true);

    // Transforme la date AAAA-MM-JJ en texte lisible (ex. "1 juillet 2026")
    const dateLisible = dispo
      ? new Date(dispo).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Dès que possible";

    // Coordonnées de la ville (pour le filtre par distance côté chercheur)
    const coord = await geocodeVille(ville.trim(), departement);

    try {
      const donnees = {
        titre: titre.trim() || null,
        loyer: Number(loyer),
        quartier: "",
        ville: ville.trim() || "Paris",
        departement,
        // arrondissement déduit si Paris (75), sinon non utilisé
        arrondissement: null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        surface: Number(surface),
        meuble,
        statut_annonceur: statutAnnonceur || null,
        type_logement: typeLogement || null,
        nb_colocs_total: Number(nbColocsTotal) || null,
        caution: Number(caution) || null,
        salle_de_bain: salleDeBain || null,
        duree_min_bail: dureeMinBail || null,
        genre_colocs: genreColocs || null,
        etage: etage.trim() || "—",
        dispo: dispo || "2026-01-01",
        date_dispo: dateLisible,
        description: description.trim(),
        photos: photos.length ? photos : [PHOTO_PAR_DEFAUT],
        criteres,
        services,
        autres_frais: autresFrais.trim() || null,
        colocs: profile
          ? [
              {
                prenom: profile.prenom,
                age: profile.age ?? 30,
                ambiance: "déjà sur place",
              },
            ]
          : [],
      };
      if (edition && listing) await updateListing(listing.id, donnees);
      else await createListing(user.id, donnees);
      onCreated();
    } catch {
      setErreur("Impossible d'enregistrer l'annonce. Réessaie.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      <Field
        label="Titre de l'annonce"
        value={titre}
        onChange={setTitre}
        placeholder="Ex. Chambre lumineuse près de la fac"
      />

      <div>
        <label className="text-sm text-ink/70">Ville</label>
        <LieuSelect
          ville={ville}
          departement={departement}
          onChange={(v, d) => {
            setVille(v);
            setDepartement(d);
          }}
          className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Loyer (€ / mois CC)" type="number" value={loyer} onChange={setLoyer} placeholder="Ex. 750" required />
        <Field label="Surface chambre (m²)" type="number" value={surface} onChange={setSurface} placeholder="Ex. 14" required />
      </div>

      <Field label="Étage" value={etage} onChange={setEtage} placeholder="Ex. 3e avec ascenseur" />

      <div>
        <label className="text-sm text-ink/70">Disponible à partir du</label>
        <input
          type="date"
          value={dispo}
          onChange={(e) => setDispo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink focus:border-pink focus:outline-none"
        />
      </div>

      {/* Statut de l'annonceur vis-à-vis du bien */}
      <div>
        <label className="text-sm text-ink/70">
          Tu es, pour ce logement…
        </label>
        <select
          value={statutAnnonceur}
          onChange={(e) => setStatutAnnonceur(e.target.value)}
          className={champSelect}
        >
          <option value="">Choisir…</option>
          {STATUTS_ANNONCEUR.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Type de logement + salle de bain */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-ink/70">Type de logement</label>
          <select value={typeLogement} onChange={(e) => setTypeLogement(e.target.value)} className={champSelect}>
            <option value="">Choisir…</option>
            {TYPES_LOGEMENT.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <label className="text-sm text-ink/70">Salle de bain</label>
          <select value={salleDeBain} onChange={(e) => setSalleDeBain(e.target.value)} className={champSelect}>
            <option value="">Choisir…</option>
            {SALLES_DE_BAIN.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
      </div>

      {/* Nb colocs total + caution */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Colocataires au total" type="number" value={nbColocsTotal} onChange={setNbColocsTotal} placeholder="Ex. 3" />
        <Field label="Caution (€)" type="number" value={caution} onChange={setCaution} placeholder="Ex. 800" />
      </div>

      {/* Durée min de bail + genre des colocs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-ink/70">Durée minimale</label>
          <select value={dureeMinBail} onChange={(e) => setDureeMinBail(e.target.value)} className={champSelect}>
            <option value="">Choisir…</option>
            {DUREES_MIN_BAIL.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>
        <div>
          <label className="text-sm text-ink/70">Colocs actuels</label>
          <select value={genreColocs} onChange={(e) => setGenreColocs(e.target.value)} className={champSelect}>
            <option value="">Choisir…</option>
            {GENRES_COLOC.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
        </div>
      </div>

      {/* Meublé */}
      <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-panel px-3 py-3">
        <input
          type="checkbox"
          checked={meuble}
          onChange={(e) => setMeuble(e.target.checked)}
          className="accent-pink h-5 w-5"
        />
        <span className="text-ink/85">Chambre meublée</span>
      </label>

      <div>
        <label className="text-sm text-ink/70">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Décris la chambre, l'ambiance de la coloc…"
          className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
        />
      </div>

      {/* Photos de l'appartement (depuis le téléphone) */}
      <div>
        <label className="text-sm text-ink/70">
          Photos de l&apos;appartement (au moins 5){" "}
          <span className="text-pink">*</span>
        </label>
        <p className="mt-1 text-xs text-ink/55">
          Obligatoire : la <strong>chambre proposée</strong>, la{" "}
          <strong>cuisine</strong>, les <strong>WC / salle de bain</strong> et les{" "}
          <strong>pièces communes</strong> (salon…).
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {photos.map((url) => (
            <div
              key={url}
              className="relative h-24 w-24 overflow-hidden rounded-xl bg-panel"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Photo" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => retirerPhoto(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
                aria-label="Retirer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/20 text-ink/50 hover:border-pink hover:text-bleu">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">
              {photoEnCours ? "Envoi…" : "Ajouter"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={ajouterPhotos}
              disabled={photoEnCours}
              className="hidden"
            />
          </label>
        </div>
        <p
          className={
            "mt-1 text-xs " + (photos.length < 5 ? "text-pink" : "text-ink/40")
          }
        >
          {photos.length < 5
            ? `Encore ${5 - photos.length} photo${5 - photos.length > 1 ? "s" : ""} à ajouter (${photos.length}/5). La première sera la photo principale.`
            : "C'est bon ! La première photo sera la photo principale."}
        </p>
      </div>

      {/* Critères */}
      <div>
        <p className="text-sm text-ink/70">Critères de vie commune</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CRITERES_POSSIBLES.map((c) => {
            const actif = criteres.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCritere(c)}
                className={
                  "rounded-full px-3 py-1.5 text-sm transition-colors " +
                  (actif ? "bg-signature text-white" : "bg-panel text-ink/70 hover:text-ink")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services compris dans la colocation */}
      <div>
        <p className="text-sm text-ink/70">Services compris</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const actif = services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={
                  "rounded-full px-3 py-1.5 text-sm transition-colors " +
                  (actif ? "bg-signature text-white" : "bg-panel text-ink/70 hover:text-ink")
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm text-ink/70">Autres frais (optionnel)</label>
        <input
          value={autresFrais}
          onChange={(e) => setAutresFrais(e.target.value)}
          placeholder="Ex. caution 1 mois, ménage 20 €/mois…"
          className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
        />
      </div>

      {erreur && (
        <p className="rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">{erreur}</p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="bg-signature glow-pink w-full rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {enCours
          ? "Enregistrement…"
          : edition
            ? "Enregistrer les modifications"
            : "Publier mon annonce"}
      </button>
    </form>
  );
}

const champSelect =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink focus:border-pink focus:outline-none";

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
      />
    </div>
  );
}
