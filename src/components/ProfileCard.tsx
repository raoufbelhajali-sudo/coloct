import { Sparkles, Star, ShieldCheck } from "lucide-react";
import type { Profile } from "@/lib/auth";
import { estSuperProfil } from "@/lib/completude";
import { estActifRecemment } from "@/lib/activite";

// Carte d'un profil colocataire (photo + infos clés). Détail complet au tap.
export default function ProfileCard({
  profile,
  compat = [],
}: {
  profile: Profile;
  compat?: string[];
}) {
  const sousTitre = [
    profile.genre,
    profile.metier,
    profile.profession,
  ]
    .filter(Boolean)
    .join(" · ");

  const estSuper = estSuperProfil(profile);

  return (
    <div className="bg-signature relative h-full w-full select-none overflow-hidden">
      {/* Les deux bannières empilées en haut à gauche (l'une sous l'autre) */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[85%] flex-col items-start gap-1.5">
        {/* Badge Super co/locataire (profil complet). On force le libellé
            « co/locataire » : cette carte montre TOUJOURS un chercheur, jamais
            un annonceur (évite un « Super annonceur » erroné si un profil a un
            rôle incohérent suite à un changement de mode). */}
        {estSuper && (
          <div className="bg-signature flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            <Star className="h-3.5 w-3.5" fill="currentColor" />
            Super co/locataire
          </div>
        )}

        {/* Bandeau "ça peut coller" si points communs */}
        {compat.length > 0 && (
          <div className="flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-pink shadow-md">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              Ça peut coller : {compat.slice(0, 3).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Photo (ou initiale sur dégradé) */}
      {profile.photo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={profile.photo_url}
          alt={profile.prenom}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-center">
          <span className="font-display text-8xl font-bold text-white/90">
            {profile.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      )}

      {/* Dégradé bas (confiné en bas pour éviter une grande zone fade vide) */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />

      {/* Infos clés. pr-20 = on laisse la colonne d'icônes (à droite) libre. */}
      <div className="absolute inset-x-0 bottom-0 pb-8 pl-5 pr-20">
        <h2 className="font-display text-3xl font-semibold leading-tight">
          {profile.prenom}
          {profile.age ? <span className="text-ink/60">, {profile.age} ans</span> : null}
        </h2>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          {profile.identite_verifiee && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bg/70 px-2 py-0.5 text-[11px] font-medium text-ink backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3 text-violet" /> Identité vérifiée
            </span>
          )}
          {estActifRecemment(profile.last_seen) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bg/70 px-2 py-0.5 text-[11px] font-medium text-ink backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Actif récemment
            </span>
          )}
        </span>
        {sousTitre && <p className="mt-0.5 text-sm text-ink/60">{sousTitre}</p>}
        <p className="mt-0.5 text-sm font-medium text-bleu">
          Cherche : {(profile.recherche_offre ?? "colocation") === "location" ? "Location" : "Colocation"}
        </p>
        {profile.budget_max ? (
          <p className="mt-0.5 text-sm font-semibold text-pink">
            Budget jusqu&apos;à {profile.budget_max} € / mois
          </p>
        ) : null}
        {profile.duree_coloc ? (
          <p className="mt-0.5 text-sm font-medium text-violet">
            Durée : {profile.duree_coloc}
          </p>
        ) : null}

        {profile.interets && profile.interets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interets.slice(0, 3).map((i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "rgba(37,99,235,0.12)", color: "#2563eb" }}
              >
                {i}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
