"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Telescope, KeyRound, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/auth";

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");

  const [role, setRole] = useState<Role>("colocataire");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  // Redirige vers le bon espace selon le rôle
  function redirige(r: Role) {
    router.push(r === "locataire" ? "/locataire" : "/swipe");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, prenom: prenom.trim() } },
      });
      if (error) {
        setErreur(traduireErreur(error.message));
        setEnCours(false);
        return;
      }
      // Si la confirmation par email est désactivée, on a une session tout de suite
      if (data.session) {
        redirige(role);
      } else {
        setErreur(
          "Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi."
        );
        setMode("login");
      }
      setEnCours(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErreur(traduireErreur(error.message));
        setEnCours(false);
        return;
      }
      // On récupère le rôle pour rediriger au bon endroit
      const { data: userData } = await supabase.auth.getUser();
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user!.id)
        .single();
      redirige((prof?.role as Role) ?? "colocataire");
      setEnCours(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-8 font-display text-3xl font-semibold">
        <span className="text-signature">Colock&apos;t</span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl bg-panel p-6">
        {/* Bascule connexion / inscription */}
        <div className="mb-6 flex rounded-full bg-panel-2 p-1 text-sm">
          <button
            onClick={() => {
              setMode("signup");
              setErreur("");
            }}
            className={
              "flex-1 rounded-full py-2 font-medium transition-colors " +
              (mode === "signup" ? "bg-signature text-white" : "text-ink/60")
            }
          >
            Créer un compte
          </button>
          <button
            onClick={() => {
              setMode("login");
              setErreur("");
            }}
            className={
              "flex-1 rounded-full py-2 font-medium transition-colors " +
              (mode === "login" ? "bg-signature text-white" : "text-ink/60")
            }
          >
            Se connecter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Choix du rôle (inscription seulement) */}
          {mode === "signup" && (
            <div>
              <p className="mb-2 text-sm text-ink/70">Je suis…</p>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  titre="Colocataire"
                  sousTitre="Je cherche une chambre"
                  icon={<Telescope className="h-7 w-7 text-pink" />}
                  actif={role === "colocataire"}
                  onClick={() => setRole("colocataire")}
                />
                <RoleCard
                  titre="Locataire"
                  sousTitre="Je propose mon bien"
                  icon={<KeyRound className="h-7 w-7 text-violet" />}
                  actif={role === "locataire"}
                  onClick={() => setRole("locataire")}
                />
              </div>
            </div>
          )}

          {/* Prénom (inscription seulement) */}
          {mode === "signup" && (
            <Field
              label="Prénom"
              type="text"
              value={prenom}
              onChange={setPrenom}
              placeholder="Ex. Camille"
              required
            />
          )}

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="toi@email.com"
            required
          />
          <Field
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Au moins 6 caractères"
            required
          />

          {erreur && (
            <p className="rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="bg-signature glow-pink w-full rounded-full px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {enCours
              ? "Un instant…"
              : mode === "signup"
                ? "Créer mon compte"
                : "Me connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}

// Carte de choix du rôle
function RoleCard({
  titre,
  sousTitre,
  icon,
  actif,
  onClick,
}: {
  titre: string;
  sousTitre: string;
  icon: ReactNode;
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
      {/* Pastille de sélection */}
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

// Champ de formulaire stylé
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-ink/70">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
      />
    </div>
  );
}

// Traduit en français les messages d'erreur courants de Supabase
function traduireErreur(msg: string): string {
  if (msg.includes("already registered")) return "Cet email a déjà un compte.";
  if (msg.includes("Invalid login")) return "Email ou mot de passe incorrect.";
  if (msg.includes("at least 6")) return "Le mot de passe doit faire au moins 6 caractères.";
  if (msg.includes("valid email")) return "Cet email n'est pas valide.";
  return "Une erreur est survenue : " + msg;
}
