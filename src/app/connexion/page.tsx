"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { supabase } from "@/lib/supabase";

// IDs Google (Cloud Console, projet "colockt")
const GOOGLE_IOS_CLIENT_ID =
  "318002057817-kvmsgko418un2urcs73p1pr3cfc1na7s.apps.googleusercontent.com";
const GOOGLE_WEB_CLIENT_ID =
  "318002057817-svim0vr5lfa4uo47o1qtos2bhif0mfit.apps.googleusercontent.com";
let socialLoginPret = false;

// Génère un nonce aléatoire (hexadécimal)
function genererNonce(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256 d'une chaîne → hexadécimal (nonce haché envoyé à Google)
async function sha256hex(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


type Etape =
  | "choix"
  | "email"
  | "emailCode"
  | "resetCode"
  | "phone"
  | "phoneCode";

export default function ConnexionPage() {
  const [etape, setEtape] = useState<Etape>("choix");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // confirmation (réinit. mot de passe)
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState(""); // message d'info (ex. code renvoyé)
  const [enCours, setEnCours] = useState(false);
  // Dans l'app native (iPhone), on masque Google + lien magique : ils ouvrent
  // un navigateur externe (barre d'adresse). On garde email + mot de passe,
  // qui reste 100% dans l'app. Sur le site web, tout reste disponible.
  const [estNatif, setEstNatif] = useState(false);
  useEffect(() => {
    setEstNatif(Capacitor.isNativePlatform());
  }, []);

  function reset() {
    setErreur("");
    setInfo("");
    setEnCours(false);
  }

  const emailValide = () => /^\S+@\S+\.\S+$/.test(email.trim());

  // --- Google sur le SITE web (redirection navigateur) ---
  async function handleGoogle() {
    reset();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/bienvenue` },
    });
    if (error) setErreur(traduireErreur(error.message));
  }

  // --- Google DANS L'APP (natif, feuille Google, sans navigateur) ---
  async function handleGoogleNatif() {
    reset();
    setEnCours(true);
    try {
      if (!socialLoginPret) {
        await SocialLogin.initialize({
          google: {
            iOSClientId: GOOGLE_IOS_CLIENT_ID,
            iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
            webClientId: GOOGLE_WEB_CLIENT_ID,
            mode: "online",
          },
        });
        socialLoginPret = true;
      }
      // IMPORTANT : forcer une connexion fraîche. Sinon le plugin restaure la
      // session Google précédente SANS notre nonce → erreur "nonce mismatch".
      try {
        await SocialLogin.logout({ provider: "google" });
      } catch {
        /* pas de session précédente : on continue */
      }

      // Sécurité "nonce" : on envoie le nonce HACHÉ à Google (il se retrouve
      // tel quel dans le jeton) et le nonce BRUT à Supabase, qui le re-hache
      // et compare. Les deux correspondent ainsi.
      const rawNonce = genererNonce();
      const hashedNonce = await sha256hex(rawNonce);
      const res = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
          nonce: hashedNonce,
          forcePrompt: true,
        },
      });
      const result = res.result as { idToken?: string | null };
      const idToken = result?.idToken;
      if (!idToken) {
        setErreur("Connexion Google impossible (jeton manquant).");
        setEnCours(false);
        return;
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
        nonce: rawNonce,
      });
      setEnCours(false);
      if (error) setErreur(traduireErreur(error.message));
      else window.location.href = "/bienvenue/";
    } catch {
      setEnCours(false);
      setErreur("Connexion Google annulée.");
    }
  }

  // --- Email + mot de passe ---
  async function connexionMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else window.location.href = "/bienvenue/";
  }

  // --- Email : connexion par CODE (sans mot de passe, reste dans l'app) ---
  async function envoyerCodeEmail() {
    reset();
    if (!emailValide()) {
      setErreur("Saisis d'abord ton email.");
      return;
    }
    setEnCours(true);
    // Pas de emailRedirectTo : on veut un code à 6 chiffres, pas un lien.
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else {
      setCode("");
      setEtape("emailCode");
    }
  }

  async function verifierCodeEmail(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setEnCours(true);
    const mail = email.trim().toLowerCase();
    const jeton = code.trim();
    // Compte existant → type "email" ; nouveau compte → type "signup".
    let { error } = await supabase.auth.verifyOtp({
      email: mail,
      token: jeton,
      type: "email",
    });
    if (error) {
      const retry = await supabase.auth.verifyOtp({
        email: mail,
        token: jeton,
        type: "signup",
      });
      error = retry.error;
    }
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else window.location.href = "/bienvenue/";
  }

  // --- Mot de passe oublié : envoi d'un CODE de réinitialisation ---
  async function demanderResetCode() {
    reset();
    if (!emailValide()) {
      setErreur("Saisis d'abord ton email.");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );
    setEnCours(false);
    if (error) setErreur(traduireErreur(error.message));
    else {
      setCode("");
      setPassword("");
      setPassword2("");
      setEtape("resetCode");
    }
  }

  async function verifierResetCode(e: React.FormEvent) {
    e.preventDefault();
    reset();
    if (password.length < 6) {
      setErreur("Mot de passe : 6 caractères minimum.");
      return;
    }
    if (password !== password2) {
      setErreur("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setEnCours(true);
    // 1) Vérifier le code (ouvre une session de récupération)
    const { error: errCode } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "recovery",
    });
    if (errCode) {
      setEnCours(false);
      setErreur(traduireErreur(errCode.message));
      return;
    }
    // 2) Définir le nouveau mot de passe
    const { error: errPwd } = await supabase.auth.updateUser({
      password,
    });
    setEnCours(false);
    if (errPwd) setErreur(traduireErreur(errPwd.message));
    else window.location.href = "/bienvenue/";
  }

  // Renvoyer un code (login ou reset selon l'étape courante)
  async function renvoyerCode() {
    if (etape === "resetCode") {
      await demanderResetCode();
    } else {
      await envoyerCodeEmail();
    }
    if (!erreur) setInfo("Nouveau code envoyé ✓");
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
    else window.location.href = "/bienvenue/";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-3">
        {/* Logo complet (symbole + nom) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-full.png"
          alt="FlatSwiper"
          className="h-12 w-auto max-w-[70vw] object-contain"
        />
      </Link>
      <p className="mb-8 text-center text-ink/60">
        Connecte-toi ou crée ton compte en un geste.
      </p>

      <div className="w-full max-w-sm rounded-3xl bg-panel p-6">
        {/* ----- Écran de choix ----- */}
        {etape === "choix" && (
          <div className="space-y-3">
            <button
              onClick={estNatif ? handleGoogleNatif : handleGoogle}
              disabled={enCours}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-4 py-3.5 font-medium text-[#1f1a2b] transition-colors hover:bg-ink/5 disabled:opacity-60"
            >
              <GoogleLogo />
              Continuer avec Google
            </button>

            {/* Connexion par SMS désactivée pour l'instant (fournisseur SMS payant
                à brancher plus tard). Le code des étapes phone reste en place. */}

            <button
              onClick={() => {
                reset();
                setEtape("email");
              }}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-panel-2 px-4 py-3.5 font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Mail className="h-5 w-5 text-bleu" />
              Continuer avec un email
            </button>
          </div>
        )}

        {/* ----- Email : saisie ----- */}
        {etape === "email" && (
          <form onSubmit={connexionMotDePasse} className="space-y-4">
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
            <div>
              <label className="text-sm text-ink/70">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ton mot de passe"
                className={champClasses}
              />
            </div>
            <BoutonPrincipal enCours={enCours} label="Se connecter" />
            <button
              type="button"
              onClick={envoyerCodeEmail}
              disabled={enCours}
              className="w-full text-center text-sm text-pink-light hover:underline disabled:opacity-60"
            >
              Pas de mot de passe ? Recevoir un code par email
            </button>
            <button
              type="button"
              onClick={demanderResetCode}
              disabled={enCours}
              className="w-full text-center text-xs text-ink/50 hover:underline disabled:opacity-60"
            >
              Mot de passe oublié ?
            </button>
          </form>
        )}

        {/* ----- Email : saisie du CODE de connexion ----- */}
        {etape === "emailCode" && (
          <form onSubmit={verifierCodeEmail} className="space-y-4">
            <Retour onClick={() => setEtape("email")} />
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-bleu" />
              <p className="mt-2 text-sm text-ink/70">
                On a envoyé un code à{" "}
                <span className="font-semibold text-ink">{email}</span> (pense
                aux spams).
              </p>
            </div>
            <div>
              <label className="text-sm text-ink/70">Code reçu par email</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className={champClasses + " text-center text-2xl tracking-[0.4em]"}
              />
            </div>
            <BoutonPrincipal enCours={enCours} label="Me connecter" />
            <button
              type="button"
              onClick={renvoyerCode}
              disabled={enCours}
              className="w-full text-center text-sm text-pink-light hover:underline disabled:opacity-60"
            >
              Renvoyer un code
            </button>
          </form>
        )}

        {/* ----- Mot de passe oublié : code + nouveau mot de passe ----- */}
        {etape === "resetCode" && (
          <form onSubmit={verifierResetCode} className="space-y-4">
            <Retour onClick={() => setEtape("email")} />
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-bleu" />
              <p className="mt-2 text-sm text-ink/70">
                On a envoyé un code à{" "}
                <span className="font-semibold text-ink">{email}</span>. Saisis-le
                puis choisis ton nouveau mot de passe.
              </p>
            </div>
            <div>
              <label className="text-sm text-ink/70">Code reçu par email</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className={champClasses + " text-center text-2xl tracking-[0.4em]"}
              />
            </div>
            <div>
              <label className="text-sm text-ink/70">Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className={champClasses}
              />
            </div>
            <div>
              <label className="text-sm text-ink/70">Confirme le mot de passe</label>
              <input
                type="password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Retape le même"
                className={champClasses}
              />
            </div>
            <BoutonPrincipal enCours={enCours} label="Changer mon mot de passe" />
            <button
              type="button"
              onClick={renvoyerCode}
              disabled={enCours}
              className="w-full text-center text-sm text-pink-light hover:underline disabled:opacity-60"
            >
              Renvoyer un code
            </button>
          </form>
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

        {info && !erreur && (
          <p className="mt-4 rounded-lg bg-bleu-clair px-3 py-2 text-sm text-bleu">
            {info}
          </p>
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
  if (msg.includes("Invalid login credentials"))
    return "Email ou mot de passe incorrect.";
  if (msg.includes("Token has expired") || msg.includes("invalid"))
    return "Code incorrect ou expiré. Réessaie.";
  if (msg.includes("rate") || msg.includes("limit"))
    return "Trop d'essais d'un coup, patiente une minute puis réessaie.";
  return "Une erreur est survenue : " + msg;
}
