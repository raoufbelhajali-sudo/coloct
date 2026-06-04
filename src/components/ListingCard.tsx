import type { Listing } from "@/data/listings";
import { lieuSous } from "@/lib/listings";

// Carte d'annonce (photo en grand + infos clés). Détail complet au tap sur la carte.
export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Photo principale */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={listing.photos[0]}
        alt={`Chambre à ${listing.quartier}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Badge prix */}
      <div className="bg-signature absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg">
        {listing.loyer} € <span className="font-medium opacity-90">/ mois CC</span>
      </div>
      {/* Badge meublé */}
      <div className="absolute top-4 right-4 rounded-full bg-bg/70 px-3 py-2 text-xs font-medium text-ink backdrop-blur-sm">
        {listing.meuble ? "Meublé" : "Non meublé"}
      </div>

      {/* Dégradé bas */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />

      {/* Infos clés (en laissant la place aux boutons en bas) */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-24">
        <h2 className="font-display text-3xl font-semibold leading-tight">
          {listing.quartier || listing.ville}
        </h2>
        <p className="mt-0.5 text-sm font-semibold text-pink">
          {lieuSous(listing)}
        </p>
        <p className="mt-2 text-sm text-ink/80">
          {listing.surface} m² · {listing.etage}
        </p>
        <p className="text-sm text-ink/60">Disponible le {listing.dateDispo}</p>
        <p className="mt-2 line-clamp-1 text-sm text-ink/55">
          {listing.description}
        </p>
      </div>
    </div>
  );
}
