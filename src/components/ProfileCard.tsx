import type { Profile } from "@/lib/auth";

// Carte d'un profil colocataire (photo + infos clés). Détail complet au tap.
export default function ProfileCard({ profile }: { profile: Profile }) {
  const sousTitre = [
    profile.pseudo ? `@${profile.pseudo}` : null,
    profile.genre,
    profile.profession,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-signature relative h-full w-full overflow-hidden rounded-3xl shadow-2xl select-none">
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

      {/* Dégradé bas */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/85 to-transparent" />

      {/* Infos clés (place laissée aux boutons) */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-24">
        <h2 className="font-display text-3xl font-semibold leading-tight">
          {profile.prenom}
          {profile.age ? <span className="text-ink/60">, {profile.age} ans</span> : null}
        </h2>
        {sousTitre && <p className="text-sm text-ink/60">{sousTitre}</p>}
        {profile.budget_max ? (
          <p className="mt-0.5 text-sm font-semibold text-pink">
            Budget jusqu&apos;à {profile.budget_max} € / mois
          </p>
        ) : null}

        {profile.interets && profile.interets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interets.slice(0, 3).map((i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "rgba(255,77,141,0.14)", color: "#ff4d8d" }}
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
