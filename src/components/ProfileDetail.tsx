"use client";

import { X, Heart } from "lucide-react";
import type { Profile } from "@/lib/auth";

// Vue détaillée d'un profil colocataire (plein écran, défilable)
export default function ProfileDetail({
  profile,
  onClose,
  onLike,
  onPass,
  preview = false,
}: {
  profile: Profile;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  preview?: boolean; // aperçu "mon profil" → pas de boutons like/pass
}) {
  const modeDeVie: string[] = [];
  (profile.ambiance ?? []).forEach((a) => modeDeVie.push(a));
  (profile.rythme ?? []).forEach((r) => modeDeVie.push(r));
  if (profile.non_fumeur) modeDeVie.push("Non-fumeur");
  if (profile.animaux) modeDeVie.push("Animaux ok");
  if (profile.teletravail) modeDeVie.push("Télétravail");

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-bg/90 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col bg-panel">
        {/* Zone défilable */}
        <div className={"flex-1 overflow-y-auto " + (preview ? "pb-8" : "pb-28")}>
          {/* Photo / dégradé */}
          <div className="bg-signature relative flex h-72 items-center justify-center overflow-hidden">
            {profile.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.photo_url}
                alt={profile.prenom}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-7xl font-bold text-white/90">
                {profile.prenom?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg/60 text-ink backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {profile.prenom}
                {profile.age ? (
                  <span className="text-ink/60">, {profile.age} ans</span>
                ) : null}
              </h2>
              <p className="text-sm text-ink/60">
                {[
                  profile.pseudo ? `@${profile.pseudo}` : null,
                  profile.genre,
                  profile.profession,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {profile.budget_max ? (
                <p className="mt-1 text-sm font-semibold text-pink">
                  Budget jusqu&apos;à {profile.budget_max} € / mois
                </p>
              ) : null}
            </div>

            {profile.bio ? (
              <p className="text-ink/80">{profile.bio}</p>
            ) : null}

            {profile.interets && profile.interets.length > 0 && (
              <Bloc titre="Centres d'intérêt">
                {profile.interets.map((i) => (
                  <Pill key={i} variante="rose">{i}</Pill>
                ))}
              </Bloc>
            )}

            {modeDeVie.length > 0 && (
              <Bloc titre="Mode de vie">
                {modeDeVie.map((m) => (
                  <Pill key={m} variante="violet">{m}</Pill>
                ))}
              </Bloc>
            )}

            {profile.quartiers && profile.quartiers.length > 0 && (
              <Bloc titre="Cherche dans">
                {profile.quartiers.map((q) => (
                  <Pill key={q} variante="neutre">{q}</Pill>
                ))}
              </Bloc>
            )}

            {profile.date_emmenagement && (
              <Bloc titre="Emménagement souhaité">
                <Pill variante="neutre">{profile.date_emmenagement}</Pill>
              </Bloc>
            )}
          </div>
        </div>

        {/* Barre d'actions fixe en bas (masquée en mode aperçu) */}
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
  variante: "rose" | "violet" | "neutre";
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
  if (variante === "rose")
    return (
      <span
        className="rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: "rgba(255,77,141,0.12)", color: "#ff4d8d" }}
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
