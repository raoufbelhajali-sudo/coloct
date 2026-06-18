import { Sparkles, Lock, Users, KeyRound } from "lucide-react";
import type { Listing } from "@/data/listings";
import { lieuSous } from "@/lib/listings";

// Carte d'annonce (photo en grand + infos clés). Détail complet au tap sur la carte.
// `flou` = masquer la publication (réservée au Pass) après les swipes gratuits.
export default function ListingCard({
  listing,
  compat = [],
  flou = false,
}: {
  listing: Listing;
  compat?: string[];
  flou?: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Photo principale */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={listing.photos[0]}
        alt={`Chambre à ${listing.quartier}`}
        className={
          "absolute inset-0 h-full w-full object-cover " +
          (flou ? "scale-110 blur-2xl" : "")
        }
        draggable={false}
      />

      {flou ? (
        /* Publication masquée : invite à passer au Pass */
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-bg/40 px-6 text-center backdrop-blur-md">
          <div className="bg-signature flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="font-display text-2xl font-semibold leading-tight">
            Annonces masquées
          </p>
          <p className="max-w-xs text-sm text-ink/75">
            Tu as utilisé tes swipes gratuits du jour. Passe au{" "}
            <span className="text-signature font-semibold">Pass FlatSwiper</span>{" "}
            pour voir toutes les annonces.
          </p>
        </div>
      ) : (
        <>
          {/* Badge prix */}
          <div className="bg-signature absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg">
            {listing.loyer} €{" "}
            <span className="font-medium opacity-90">/ mois CC</span>
          </div>
          {/* Badges haut-droite : type d'offre (pin) + meublé */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {(listing.typeOffre ?? "colocation") === "location" ? (
              <div className="flex items-center gap-1 rounded-full bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                <KeyRound className="h-3.5 w-3.5" /> Location
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-[#14b8a6] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                <Users className="h-3.5 w-3.5" /> Colocation
              </div>
            )}
            <div className="rounded-full bg-bg/70 px-3 py-2 text-xs font-medium text-ink backdrop-blur-sm">
              {listing.meuble ? "Meublé" : "Non meublé"}
            </div>
          </div>
          {/* Bandeau "ça peut coller" — placé sous le prix pour ne pas le cacher */}
          {compat.length > 0 && (
            <div className="absolute left-4 top-16 z-10 flex max-w-[85%] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-pink shadow-md">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Ça peut coller : {compat.slice(0, 3).join(", ")}
              </span>
            </div>
          )}

          {/* Dégradé bas */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />

          {/* Infos clés. pr-20 = on laisse la colonne d'icônes (à droite) libre
              pour ne pas recouvrir le texte de l'annonce. */}
          <div className="absolute inset-x-0 bottom-0 pb-24 pl-5 pr-20">
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
        </>
      )}
    </div>
  );
}
