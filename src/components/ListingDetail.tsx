"use client";

import { X, Heart } from "lucide-react";
import type { Listing } from "@/data/listings";
import { lieuSous } from "@/lib/listings";

// Vue détaillée d'une annonce (toutes les photos + infos), plein écran défilable.
export default function ListingDetail({
  listing,
  onClose,
  onLike,
  onPass,
  preview = false,
}: {
  listing: Listing;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  preview?: boolean; // aperçu "mon annonce" → pas de boutons like/pass
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-bg/90 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col bg-panel">
        {/* Zone défilable */}
        <div className={"flex-1 overflow-y-auto " + (preview ? "pb-8" : "pb-28")}>
          {/* Galerie de photos (défilement horizontal) */}
          <div className="relative">
            <div className="flex h-80 snap-x snap-mandatory overflow-x-auto">
              {listing.photos.map((p, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={p}
                  alt={`${listing.quartier} - photo ${i + 1}`}
                  className="h-80 w-full shrink-0 snap-center object-cover"
                  draggable={false}
                />
              ))}
            </div>

            {/* Badge prix */}
            <div className="bg-signature absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg">
              {listing.loyer} €{" "}
              <span className="font-medium opacity-90">/ mois CC</span>
            </div>
            {/* Badge meublé */}
            <div className="absolute top-4 right-16 rounded-full bg-bg/70 px-3 py-2 text-xs font-medium text-ink backdrop-blur-sm">
              {listing.meuble ? "Meublé" : "Non meublé"}
            </div>
            {/* Fermer */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg/70 text-ink backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Indicateur nombre de photos */}
            {listing.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-bg/60 px-3 py-1 text-xs text-ink backdrop-blur-sm">
                {listing.photos.length} photos · fais glisser →
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-5 p-5">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {listing.quartier || listing.ville}
              </h2>
              <p className="text-sm font-semibold text-pink">
                {lieuSous(listing)}
              </p>
            </div>

            <div className="space-y-1 text-sm text-ink/80">
              <p>
                {listing.surface} m² · {listing.etage}
              </p>
              <p>{listing.meuble ? "Meublé" : "Non meublé"}</p>
              <p>Disponible le {listing.dateDispo}</p>
            </div>

            {/* L'annonceur (visage) dans la description */}
            {(listing.ownerPhoto || listing.ownerPrenom) && (
              <div className="flex items-center gap-3 rounded-2xl bg-panel-2 p-3">
                <div className="bg-signature h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  {listing.ownerPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={listing.ownerPhoto}
                      alt={listing.ownerPrenom ?? "Annonceur"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-white">
                      {listing.ownerPrenom?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-ink/50">Proposé par</p>
                  <p className="font-medium">
                    {listing.ownerPrenom ?? "L'annonceur"}
                  </p>
                </div>
              </div>
            )}

            {listing.description ? (
              <p className="text-ink/85">{listing.description}</p>
            ) : null}

            {/* Colocs déjà sur place */}
            {listing.colocs && listing.colocs.length > 0 && (
              <Bloc titre="Qui vit déjà là">
                {listing.colocs.map((c) => (
                  <Pill key={c.prenom} variante="neutre">
                    {c.prenom}, {c.age} ans · {c.ambiance}
                  </Pill>
                ))}
              </Bloc>
            )}

            {/* Services compris */}
            {listing.services && listing.services.length > 0 && (
              <Bloc titre="Services compris">
                {listing.services.map((s) => (
                  <Pill key={s} variante="neutre">{s}</Pill>
                ))}
              </Bloc>
            )}

            {listing.autresFrais ? (
              <div>
                <p className="text-xs text-ink/50">Autres frais</p>
                <p className="text-sm text-ink/85">{listing.autresFrais}</p>
              </div>
            ) : null}

            {/* Critères de vie commune */}
            {listing.criteres && listing.criteres.length > 0 && (
              <Bloc titre="Vie commune">
                {listing.criteres.map((cr) => (
                  <Pill key={cr} variante="violet">{cr}</Pill>
                ))}
              </Bloc>
            )}
          </div>
        </div>

        {/* Barre d'actions fixe (masquée en mode aperçu) */}
        {!preview && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 bg-gradient-to-t from-panel via-panel to-transparent py-5">
            <button
              onClick={onPass}
              aria-label="Je passe"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/15 bg-bg text-ink/60 transition-transform hover:scale-110"
            >
              <X className="h-7 w-7" strokeWidth={2.5} />
            </button>
            <button
              onClick={onLike}
              aria-label="Ça m'intéresse"
              className="bg-signature glow-pink flex h-20 w-20 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            >
              <Heart className="h-9 w-9" fill="currentColor" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-ink/50">{titre}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  children,
  variante,
}: {
  children: React.ReactNode;
  variante: "violet" | "neutre";
}) {
  if (variante === "violet")
    return (
      <span
        className="rounded-full border border-violet/40 px-3 py-1 text-xs font-medium"
        style={{ color: "#6d28d9" }}
      >
        {children}
      </span>
    );
  return (
    <span className="rounded-full bg-panel-2 px-3 py-1 text-xs text-ink/85">
      {children}
    </span>
  );
}
