"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, ChevronRight, Share2, MessageSquare } from "lucide-react";
import type { Listing } from "@/data/listings";
import { useAuth, type Profile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { lieuSous } from "@/lib/listings";
import { partagerAnnonce } from "@/lib/partage";
import { contacterDirect } from "@/lib/offers";
import { findMatchForListing } from "@/lib/swipes";
import ProfileDetail from "@/components/ProfileDetail";

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
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [annonceurProfil, setAnnonceurProfil] = useState<Profile | null>(null);
  const [voirAnnonceur, setVoirAnnonceur] = useState(false);
  const [contactEnCours, setContactEnCours] = useState(false);

  const credits = profile?.credits_messages ?? 0;
  const peutContacter =
    !preview &&
    profile?.role === "colocataire" &&
    credits > 0 &&
    !!listing.ownerId;

  // Contacter directement l'annonceur (consomme 1 crédit si nouvelle conversation)
  async function contacter() {
    if (!user || !profile || !listing.ownerId) return;
    setContactEnCours(true);
    const deja = await findMatchForListing(user.id, listing.id);
    const matchId = await contacterDirect(listing.id);
    if (!matchId) {
      setContactEnCours(false);
      return;
    }
    if (!deja) {
      await supabase
        .from("profiles")
        .update({ credits_messages: Math.max(0, credits - 1) })
        .eq("id", user.id);
      await refreshProfile();
    }
    router.push(`/matchs/conversation/?id=${matchId}`);
  }

  // Ouvre le profil (la personne) de l'annonceur
  async function ouvrirAnnonceur() {
    if (!listing.ownerId) return;
    if (!annonceurProfil) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listing.ownerId)
        .maybeSingle();
      setAnnonceurProfil((data as Profile) ?? null);
    }
    setVoirAnnonceur(true);
  }
  return (
    <>
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
                {listing.titre || listing.quartier || listing.ville}
              </h2>
              <p className="text-sm font-semibold text-pink">
                {lieuSous(listing)}
              </p>
            </div>

            {/* Contacter directement (crédits messages, sans match) */}
            {peutContacter && (
              <button
                onClick={contacter}
                disabled={contactEnCours}
                className="bg-signature glow-pink flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                <MessageSquare className="h-4 w-4" />
                {contactEnCours
                  ? "Un instant…"
                  : `Contacter directement (${credits} crédit${credits > 1 ? "s" : ""})`}
              </button>
            )}

            <div className="space-y-1 text-sm text-ink/80">
              <p>
                {listing.surface} m² · {listing.etage}
              </p>
              <p>
                {listing.meuble ? "Meublé" : "Non meublé"}
                {listing.typeLogement ? ` · ${listing.typeLogement}` : ""}
                {listing.salleDeBain ? ` · SdB ${listing.salleDeBain.toLowerCase()}` : ""}
              </p>
              {listing.nbColocsTotal ? (
                <p>{listing.nbColocsTotal} colocataires au total</p>
              ) : null}
              {listing.genreColocs ? <p>Colocs : {listing.genreColocs}</p> : null}
              {listing.caution ? <p>Caution : {listing.caution} €</p> : null}
              {listing.dureeMinBail && listing.dureeMinBail !== "Sans minimum" ? (
                <p>Engagement : {listing.dureeMinBail}</p>
              ) : null}
              {listing.statutAnnonceur ? (
                <p className="font-medium text-violet">
                  Annonceur : {listing.statutAnnonceur}
                </p>
              ) : null}
              <p>Disponible le {listing.dateDispo}</p>
            </div>

            {/* L'annonceur (visage) — cliquable pour voir son profil */}
            {(listing.ownerPhoto || listing.ownerPrenom) && (
              <button
                type="button"
                onClick={ouvrirAnnonceur}
                className="flex w-full items-center gap-3 rounded-2xl bg-panel-2 p-3 text-left transition-colors hover:bg-panel"
              >
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
                <div className="flex-1">
                  <p className="text-xs text-ink/50">Proposé par</p>
                  <p className="font-medium">
                    {listing.ownerPrenom ?? "L'annonceur"}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-xs text-pink">
                  Voir le profil <ChevronRight className="h-4 w-4" />
                </span>
              </button>
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
              onClick={() => partagerAnnonce(listing)}
              aria-label="Partager"
              title="Partager"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/15 bg-bg text-ink/60 transition-transform hover:scale-110 hover:text-bleu"
            >
              <Share2 className="h-6 w-6" />
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

    {/* Profil de l'annonceur (clic sur sa photo) */}
    {voirAnnonceur && annonceurProfil && (
      <ProfileDetail
        profile={annonceurProfil}
        preview
        onClose={() => setVoirAnnonceur(false)}
      />
    )}
    </>
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
        style={{ color: "#e8590c" }}
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
