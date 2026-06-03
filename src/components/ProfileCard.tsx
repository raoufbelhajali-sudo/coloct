import type { Profile } from "@/lib/auth";

// Affiche la carte d'un profil colocataire (vue côté locataire)
export default function ProfileCard({ profile }: { profile: Profile }) {
  // Petits libellés de mode de vie
  const modeDeVie: string[] = [];
  if (profile.non_fumeur) modeDeVie.push("Non-fumeur");
  if (profile.animaux) modeDeVie.push("Animaux");
  if (profile.teletravail) modeDeVie.push("Télétravail");

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Haut : grand dégradé avec l'initiale */}
      <div className="bg-signature flex h-2/5 items-center justify-center">
        <span className="font-display text-7xl font-bold text-white/90">
          {profile.prenom?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>

      {/* Bas : informations */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight">
            {profile.prenom}
            {profile.age ? (
              <span className="text-ink/60">, {profile.age} ans</span>
            ) : null}
          </h2>
          {profile.budget_max ? (
            <p className="mt-0.5 text-sm font-medium text-pink-light">
              Budget jusqu&apos;à {profile.budget_max} € / mois
            </p>
          ) : null}
        </div>

        {profile.bio ? (
          <p className="text-sm text-ink/75">{profile.bio}</p>
        ) : null}

        {/* Quartiers recherchés */}
        {profile.quartiers && profile.quartiers.length > 0 && (
          <div>
            <p className="text-xs text-ink/50">Cherche dans</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {profile.quartiers.map((q) => (
                <span
                  key={q}
                  className="rounded-full bg-panel-2 px-3 py-1 text-xs text-ink/85"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mode de vie */}
        {modeDeVie.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {modeDeVie.map((m) => (
              <span
                key={m}
                className="rounded-full border border-violet/40 px-3 py-1 text-xs font-medium"
                style={{ color: "#6d28d9" }}
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
