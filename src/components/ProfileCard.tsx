import type { Profile } from "@/lib/auth";

// Carte d'un profil colocataire (vue côté locataire), avec toutes ses infos.
export default function ProfileCard({ profile }: { profile: Profile }) {
  // Étiquettes de mode de vie
  const modeDeVie: string[] = [];
  if (profile.ambiance) modeDeVie.push(profile.ambiance);
  if (profile.rythme) modeDeVie.push(profile.rythme);
  if (profile.non_fumeur) modeDeVie.push("Non-fumeur");
  if (profile.animaux) modeDeVie.push("Animaux ok");
  if (profile.teletravail) modeDeVie.push("Télétravail");

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-panel shadow-2xl select-none">
      {/* Haut : photo si dispo, sinon dégradé + initiale */}
      <div className="bg-signature flex h-48 shrink-0 items-center justify-center overflow-hidden">
        {profile.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.photo_url}
            alt={profile.prenom}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="font-display text-6xl font-bold text-white/90">
            {profile.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>

      {/* Bas : infos (défilable si besoin) */}
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {/* Nom + âge + genre */}
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
            <p className="mt-1 text-sm font-semibold text-pink">
              Budget jusqu&apos;à {profile.budget_max} € / mois
            </p>
          ) : null}
        </div>

        {/* Présentation */}
        {profile.bio ? <p className="text-sm text-ink/75">{profile.bio}</p> : null}

        {/* Centres d'intérêt */}
        {profile.interets && profile.interets.length > 0 && (
          <Bloc titre="Centres d'intérêt">
            {profile.interets.map((i) => (
              <Pill key={i} variante="rose">{i}</Pill>
            ))}
          </Bloc>
        )}

        {/* Mode de vie */}
        {modeDeVie.length > 0 && (
          <Bloc titre="Mode de vie">
            {modeDeVie.map((m) => (
              <Pill key={m} variante="violet">{m}</Pill>
            ))}
          </Bloc>
        )}

        {/* Quartiers recherchés */}
        {profile.quartiers && profile.quartiers.length > 0 && (
          <Bloc titre="Cherche dans">
            {profile.quartiers.map((q) => (
              <Pill key={q} variante="neutre">{q}</Pill>
            ))}
          </Bloc>
        )}
      </div>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-ink/50">{titre}</p>
      <div className="mt-1 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  children,
  variante,
}: {
  children: React.ReactNode;
  variante: "rose" | "violet" | "neutre";
}) {
  if (variante === "violet") {
    return (
      <span
        className="rounded-full border border-violet/40 px-3 py-1 text-xs font-medium"
        style={{ color: "#6d28d9" }}
      >
        {children}
      </span>
    );
  }
  if (variante === "rose") {
    return (
      <span
        className="rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: "rgba(255,77,141,0.12)", color: "#ff4d8d" }}
      >
        {children}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-panel-2 px-3 py-1 text-xs text-ink/85">
      {children}
    </span>
  );
}
