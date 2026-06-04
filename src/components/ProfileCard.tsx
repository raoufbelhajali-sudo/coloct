import { ChevronDown } from "lucide-react";
import type { Profile } from "@/lib/auth";

// Aperçu d'un profil colocataire (carte du swipe). Détail complet au tap / via le bouton.
export default function ProfileCard({
  profile,
  onOpen,
}: {
  profile: Profile;
  onOpen?: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Photo (ou dégradé + initiale) */}
      <div className="bg-signature flex h-64 shrink-0 items-center justify-center overflow-hidden">
        {profile.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.photo_url}
            alt={profile.prenom}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="font-display text-7xl font-bold text-white/90">
            {profile.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>

      {/* Aperçu des infos */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight">
            {profile.prenom}
            {profile.age ? <span className="text-ink/60">, {profile.age} ans</span> : null}
          </h2>
          <p className="text-sm text-ink/60">
            {[profile.pseudo ? `@${profile.pseudo}` : null, profile.genre, profile.profession]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {profile.budget_max ? (
            <p className="mt-0.5 text-sm font-semibold text-pink">
              Budget jusqu&apos;à {profile.budget_max} € / mois
            </p>
          ) : null}
        </div>

        {profile.bio ? (
          <p className="line-clamp-2 text-sm text-ink/75">{profile.bio}</p>
        ) : null}

        {profile.interets && profile.interets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.interets.slice(0, 4).map((i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "rgba(255,77,141,0.12)", color: "#ff4d8d" }}
              >
                {i}
              </span>
            ))}
          </div>
        )}

        {/* Bouton pour ouvrir le profil complet */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="mt-auto flex items-center justify-center gap-1 rounded-full bg-panel-2 py-2 text-xs font-medium text-ink/70 transition-colors hover:text-ink"
        >
          <ChevronDown className="h-4 w-4" />
          Voir le profil
        </button>
      </div>
    </div>
  );
}
