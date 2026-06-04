"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Telescope, KeyRound, Check } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function BienvenuePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [role, setRole] = useState<Role>("colocataire");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [besoinEmail, setBesoinEmail] = useState(false); // vrai si connecté par téléphone (pas d'email)
  const [enCours, setEnCours] = useState(false);
  const [pret, setPret] = useState(false);

  function redirige(r: Role) {
    router.replace(r === "locataire" ? "/locataire" : "/swipe");
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (!profile) return;

    // Déjà passé par ici (prénom renseigné) → on file vers son espace
    if (profile.prenom && profile.prenom !== "Anonyme") {
      redirige(profile.role);
      return;
    }

    // Nouveau venu : on pré-remplit le prénom avec son nom (Google) s'il y en a un
    const meta = user.user_metadata as Record<string, string> | undefined;
    const nomGoogle =
      meta?.given_name || meta?.name || meta?.full_name || "";
    setPrenom(nomGoogle.split(" ")[0] || "");
    // Connecté par téléphone (donc sans email) → on lui demandera son email
    setBesoinEmail(!user.email);
    setPret(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setEnCours(true);
    // Si connecté par téléphone, on enregistre l'email saisi
    if (besoinEmail && email.trim()) {
      await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    }
    await supabase
      .from("profiles")
      .update({ role, prenom: prenom.trim() || "Coloc" })
      .eq("id", user.id);
    await refreshProfile();
    redirige(role);
  }

  if (!pret) {
    return (
      <main className="flex min-h-screen items-center justify-center text-ink/60">
        Un instant…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-2 font-display text-3xl font-semibold">
        Bienvenue sur <span className="text-signature">Colock&apos;t</span> !
      </h1>
      <p className="mb-8 text-center text-ink/60">
        Dis-nous juste qui tu es pour commencer.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <p className="mb-2 text-sm text-ink/70">Je suis…</p>
          <div className="grid grid-cols-2 gap-3">
            <RoleChoix
              titre="Colocataire"
              sousTitre="Je cherche une chambre"
              icon={<Telescope className="h-7 w-7 text-pink" />}
              actif={role === "colocataire"}
              onClick={() => setRole("colocataire")}
            />
            <RoleChoix
              titre="Locataire"
              sousTitre="Je propose mon bien"
              icon={<KeyRound className="h-7 w-7 text-violet" />}
              actif={role === "locataire"}
              onClick={() => setRole("locataire")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prenom" className="text-sm text-ink/70">
            Ton prénom
          </label>
          <input
            id="prenom"
            type="text"
            required
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Ex. Camille"
            className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
          />
        </div>

        {besoinEmail && (
          <div>
            <label htmlFor="email" className="text-sm text-ink/70">
              Ton email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@email.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-ink/10 bg-panel px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {enCours ? "Un instant…" : "C'est parti !"}
        </button>
      </form>
    </main>
  );
}

function RoleChoix({
  titre,
  sousTitre,
  icon,
  actif,
  onClick,
}: {
  titre: string;
  sousTitre: string;
  icon: React.ReactNode;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative rounded-2xl border-2 p-3 text-left transition-all " +
        (actif
          ? "border-pink bg-pink/10 shadow-md"
          : "border-ink/10 bg-panel hover:border-ink/30")
      }
    >
      {actif && (
        <span className="bg-signature absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
      {icon}
      <div className={"mt-2 font-semibold " + (actif ? "text-pink" : "")}>
        {titre}
      </div>
      <div className="text-xs text-ink/60">{sousTitre}</div>
    </button>
  );
}
