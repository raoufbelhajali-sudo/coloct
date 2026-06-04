"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Etape = "choix" | "email" | "emailEnvoye" | "phone" | "phoneCode";

export default function ConnexionPage() {
  const [etape, setEtape] = useState<Etape>("choix");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  function reset() {
    setErreur("");
    setEnCours(false);
  }

  // --- Google ---
  async function handleGoogle() {
    reset();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/bienvenue` },
    });
    if (error) setErreur(traduireErreur(error.message));
  }

  // --- Email (lien magique) ---
  async function envoyerLienEmail(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setEnCours(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/bienvenue` },
    });
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else setEtape("emailEnvoye");
  }

  // --- Téléphone (code SMS) ---
  async function envoyerCodeSms(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setEnCours(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else setEtape("phoneCode");
  }

  async function verifierCodeSms(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setEnCours(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: "sms",
    });
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else window.location.href = "/bienvenue";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-3 font-display text-3xl font-semibold">
        <span className="text-signature">Colock&apos;t</span>
      </Link>
      <p className="mb-8 text-center text-ink/60">
        Connecte-toi ou crée ton compte en un geste.
      </p>

      <div className="w-full max-w-sm rounded-3xl bg-panel p-6">
        {/* ----- Écran de choix ----- */}
        {etape === "choix" && (
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-4 py-3.5 font-medium text-[#1f1a2b] transition-colors hover:bg-ink/5"
            >
              <GoogleLogo />
              Continuer avec Google
            </button>

            <button
              onClick={() => {
                reset();
                setEtape("phone");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-panel-2 px-4 py-3.5 font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Phone className="h-5 w-5 text-violet" />
              Continuer avec un téléphone
            </button>

            <button
              onClick={() => {
                reset();
                setEtape("email");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-panel-2 px-4 py-3.5 font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Mail className="h-5 w-5 text-pink" />
              Continuer avec un email
            </button>
          </div>
        )}

        {/* ----- Email : saisie ----- */}
        {etape === "email" && (
          <form onSubmit={envoyerLienEmail} className="space-y-4">
            <Retour onClick={() => setEtape("choix")} />
            <div>
              <label className="text-sm text-ink/70">Ton email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={champClasses}
              />
            </div>
            <BoutonPrincipal enCours={enCours} label="Recevoir mon lien" />
          </form>
        )}

        {/* ----- Email : lien envoyé ----- */}
        {etape === "emailEnvoye" && (
          <div className="space-y-4 text-center">
            <Mail className="mx-auto h-12 w-12 text-pink" />
            <p className="font-display text-xl">Vérifie ta boîte mail !</p>
            <p className="text-sm text-ink/70">
              On a envoyé un lien de connexion à{" "}
              <span className="font-semibold text-ink">{email}</span>. Clique
              dessus pour entrer (pense à regarder les spams).
            </p>
            <button
              onClick={() => setEtape("choix")}
              className="text-sm text-pink-light hover:underline"
            >
              Utiliser une autre méthode
            </button>
          </div>
        )}

        {/* ----- Téléphone : saisie du numéro ----- */}
        {etape === "phone" && (
          <form onSubmit={envoyerCodeSms} className="space-y-4">
            <Retour onClick={() => setEtape("choix")} />
            <div>
              <label className="text-sm text-ink/70">Ton numéro</label>
              <input
                type="tel"
                required
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className={champClasses}
              />
              <p className="mt-1 text-xs text-ink/40">
                Au format international, ex. +33612345678
              </p>
            </div>
            <BoutonPrincipal enCours={enCours} label="Recevoir le code" />
          </form>
        )}

        {/* ----- Téléphone : saisie du code ----- */}
        {etape === "phoneCode" && (
          <form onSubmit={verifierCodeSms} className="space-y-4">
            <Retour onClick={() => setEtape("phone")} />
            <div>
              <label className="text-sm text-ink/70">Code reçu par SMS</label>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className={champClasses + " text-center text-2xl tracking-[0.4em]"}
              />
            </div>
            <BoutonPrincipal enCours={enCours} label="Me connecter" />
          </form>
        )}

        {erreur && (
          <p className="mt-4 rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink-light">
            {erreur}
          </p>
        )}
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-ink/40">
        Pas de mot de passe à retenir : on te reconnaît automatiquement.
      </p>
    </main>
  );
}

const champClasses =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";

function Retour({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-ink/60 hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" /> Retour
    </button>
  );
}

function BoutonPrincipal({
  enCours,
  label,
}: {
  enCours: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={enCours}
      className="bg-signature glow-pink w-full rounded-full px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {enCours ? "Un instant…" : label}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function traduireErreur(msg: string): string {
  if (msg.toLowerCase().includes("sms") || msg.toLowerCase().includes("phone"))
    return "L'envoi de SMS n'est pas encore activé (service SMS à brancher).";
  if (msg.includes("Token has expired") || msg.includes("invalid"))
    return "Code incorrect ou expiré. Réessaie.";
  if (msg.includes("rate") || msg.includes("limit"))
    return "Trop d'essais d'un coup, patiente une minute puis réessaie.";
  return "Une erreur est survenue : " + msg;
}
