"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createListing, updateListing } from "@/lib/locataire";
import type { Listing } from "@/data/listings";
import LieuSelect from "@/components/LieuSelect";
import { SERVICES } from "@/lib/profilOptions";

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

  const [quartier, setQuartier] = useState(listing?.quartier ?? "");
  const [ville, setVille] = useState(listing?.ville ?? "Paris");
  const [departement, setDepartement] = useState(listing?.departement ?? "75");
  const [loyer, setLoyer] = useState(listing ? String(listing.loyer) : "");
  const [surface, setSurface] = useState(listing ? String(listing.surface) : "");
  const [nbOccupants, setNbOccupants] = useState(
    listing?.nbOccupants ? String(listing.nbOccupants) : ""
  );
  const [meuble, setMeuble] = useState(listing?.meuble ?? true);
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
    if (photos.length === 0) {
      setErreur("Ajoute au moins une photo de l'appartement.");
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

    try {
      const donnees = {
        loyer: Number(loyer),
        quartier: quartier.trim(),
        ville: ville.trim() || "Paris",
        departement,
        // arrondissement déduit si Paris (75), sinon non utilisé
        arrondissement: null,
        surface: Number(surface),
        nb_occupants: Number(nbOccupants) || null,
        meuble,
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

      <Field
        label="Quartier / secteur (optionnel)"
        value={quartier}
        onChange={setQuartier}
        placeholder="Ex. Le Marais"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Loyer (€ / mois CC)" type="number" value={loyer} onChange={setLoyer} placeholder="Ex. 750" required />
        <Field label="Surface chambre (m²)" type="number" value={surface} onChange={setSurface} placeholder="Ex. 14" required />
      </div>

      <Field label="Étage" value={etage} onChange={setEtage} placeholder="Ex. 3e avec ascenseur" />

      <Field
        label="Personnes dans le logement"
        type="number"
        value={nbOccupants}
        onChange={setNbOccupants}
        placeholder="Ex. 2 (colocs déjà sur place)"
      />

      <div>
        <label className="text-sm text-ink/70">Disponible à partir du</label>
        <input
          type="date"
          value={dispo}
          onChange={(e) => setDispo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink focus:border-pink focus:outline-none"
        />
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
          Photos de l&apos;appartement <span className="text-pink">*</span>
        </label>
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
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/20 text-ink/50 hover:border-pink hover:text-pink">
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
        <p className="mt-1 text-xs text-ink/40">
          Au moins une photo par pièce (chambre, salon, cuisine, salle de
          bain…). La première sera la photo principale.
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
