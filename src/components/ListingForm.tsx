"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createListing } from "@/lib/locataire";

const PHOTO_PAR_DEFAUT =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70";

const CRITERES_POSSIBLES = [
  "Non-fumeur",
  "Animaux bienvenus",
  "Télétravail friendly",
  "Soirées OK",
  "Calme",
];

// Formulaire de création de l'annonce (le bien) du locataire
export default function ListingForm({ onCreated }: { onCreated: () => void }) {
  const { user, profile } = useAuth();

  const [quartier, setQuartier] = useState("");
  const [arrondissement, setArrondissement] = useState("");
  const [loyer, setLoyer] = useState("");
  const [surface, setSurface] = useState("");
  const [meuble, setMeuble] = useState(true);
  const [etage, setEtage] = useState("");
  const [dispo, setDispo] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(PHOTO_PAR_DEFAUT);
  const [criteres, setCriteres] = useState<string[]>(["Non-fumeur"]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  function toggleCritere(c: string) {
    setCriteres((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErreur("");
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
      await createListing(user.id, {
        loyer: Number(loyer),
        quartier: quartier.trim(),
        arrondissement: Number(arrondissement),
        surface: Number(surface),
        meuble,
        etage: etage.trim() || "—",
        dispo: dispo || "2026-01-01",
        date_dispo: dateLisible,
        description: description.trim(),
        photos: [photo.trim() || PHOTO_PAR_DEFAUT],
        criteres,
        colocs: profile
          ? [
              {
                prenom: profile.prenom,
                age: profile.age ?? 30,
                ambiance: "déjà sur place",
              },
            ]
          : [],
      });
      onCreated();
    } catch {
      setErreur("Impossible d'enregistrer l'annonce. Réessaie.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Quartier" value={quartier} onChange={setQuartier} placeholder="Ex. Le Marais" required />
        <Field label="Arrondissement" type="number" value={arrondissement} onChange={setArrondissement} placeholder="Ex. 4" required />
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

      <Field label="Lien d'une photo" value={photo} onChange={setPhoto} placeholder="https://…" />

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

      {erreur && (
        <p className="rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">{erreur}</p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="bg-signature glow-pink w-full rounded-full px-6 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {enCours ? "Publication…" : "Publier mon annonce"}
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
