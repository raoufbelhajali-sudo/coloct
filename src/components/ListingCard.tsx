import { ChevronDown } from "lucide-react";
import type { Listing } from "@/data/listings";

// Affiche une carte d'annonce (photo + infos). Détail complet au tap / via le bouton.
export default function ListingCard({
  listing,
  onOpen,
}: {
  listing: Listing;
  onOpen?: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Photo principale en grand */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={listing.photos[0]}
        alt={`Chambre à ${listing.quartier}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Badge de prix en dégradé rose→violet, en haut à gauche */}
      <div className="bg-signature absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg">
        {listing.loyer} € <span className="font-medium opacity-90">/ mois CC</span>
      </div>

      {/* Badge meublé / non meublé en haut à droite */}
      <div className="absolute top-4 right-4 rounded-full bg-bg/70 px-3 py-2 text-xs font-medium text-ink backdrop-blur-sm">
        {listing.meuble ? "Meublé" : "Non meublé"}
      </div>

      {/* Dégradé sombre en bas pour faire ressortir le texte */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />

      {/* Bloc d'informations en bas */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {/* Quartier + arrondissement */}
        <h2 className="font-display text-3xl font-semibold leading-tight">
          {listing.quartier}
        </h2>
        <p className="mt-0.5 text-sm font-semibold text-pink">
          Paris {listing.arrondissement}
          <sup>e</sup>
        </p>

        {/* Ligne d'infos clés */}
        <p className="mt-3 text-sm text-ink/80">
          {listing.surface} m² · {listing.etage}
        </p>
        <p className="text-sm text-ink/60">
          Disponible le {listing.dateDispo}
        </p>

        {/* Description courte */}
        <p className="mt-3 line-clamp-2 text-sm text-ink/70">
          {listing.description}
        </p>

        {/* Colocs déjà sur place */}
        <div className="mt-3 flex flex-wrap gap-2">
          {listing.colocs.map((c) => (
            <span
              key={c.prenom}
              className="rounded-full bg-panel-2 px-3 py-1 text-xs text-ink/85"
            >
              {c.prenom}, {c.age} ans · {c.ambiance}
            </span>
          ))}
        </div>

        {/* Critères de vie commune */}
        <div className="mt-2 flex flex-wrap gap-2">
          {listing.criteres.map((crit) => (
            <span
              key={crit}
              className="rounded-full border border-violet/40 px-3 py-1 text-xs font-medium"
              style={{ color: "#6d28d9" }}
            >
              {crit}
            </span>
          ))}
        </div>

        {/* Bouton pour voir l'annonce en détail (photos + infos) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-full bg-panel-2 py-2 text-xs font-medium text-ink/70 transition-colors hover:text-ink"
        >
          <ChevronDown className="h-4 w-4" />
          Voir l&apos;annonce ({listing.photos.length} photo
          {listing.photos.length > 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
}
