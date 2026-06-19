"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Phone, Lock, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { telFrancaisValide } from "@/lib/tel";
import AppHeader from "@/components/AppHeader";

// Page « Paramètres du compte » : email, téléphone (toujours enregistré) et
// mot de passe — regroupés ici pour alléger la page Réglages.
export default function ComptePage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  // Changement de mot de passe (par code email, reste dans l'app)
  const [resetEnvoi, setResetEnvoi] = useState(false);
  const [resetEnvoye, setResetEnvoye] = useState(false);
  const [resetErreur, setResetErreur] = useState("");
  const [resetOk, setResetOk] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetMdp, setResetMdp] = useState("");
  const [resetMdp2, setResetMdp2] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    setEmail(user.email ?? "");
    setTelephone(
      user.phone || (typeof meta.telephone === "string" ? meta.telephone : "")
    );
  }, [loading, user, router]);

  async function enregistrer() {
    if (!user) return;
    setErreur("");
    setMessage("");
    // Téléphone : doit être un numéro français (10 chiffres)
    if (telephone.trim() && !telFrancaisValide(telephone)) {
      setErreur("Numéro de téléphone français à 10 chiffres requis (ex. 06 12 34 56 78).");
      return;
    }
    setEnCours(true);

    // Téléphone : on l'enregistre TOUJOURS, à la fois sur le compte
    // (user_metadata) et sur le profil (contact_tel, utilisé dans les annonces).
    const tel = telephone.trim();
    await supabase
      .from("profiles")
      .update({ contact_tel: tel || null })
      .eq("id", user.id);

    const emailChange =
      email.trim().toLowerCase() !== (user.email ?? "").toLowerCase();
    const updates: { email?: string; data: Record<string, unknown> } = {
      data: { telephone: tel },
    };
    if (emailChange && email.trim()) updates.email = email.trim().toLowerCase();

    const { error } = await supabase.auth.updateUser(updates);
    await refreshProfile();
    setEnCours(false);

    if (error) {
      setErreur(traduire(error.message));
      return;
    }
    setMessage(
      emailChange
        ? "Modifications enregistrées. Vérifie ta boîte mail pour confirmer ton nouvel email."
        : "Modifications enregistrées ✓"
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage(""), 4000);
  }

  async function demanderResetMdp() {
    if (!user?.email) return;
    setResetEnvoi(true);
    setResetErreur("");
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    setResetEnvoi(false);
    if (error) setResetErreur("Échec de l'envoi. Réessaie dans un instant.");
    else {
      setResetCode("");
      setResetMdp("");
      setResetMdp2("");
      setResetEnvoye(true);
    }
  }

  async function validerNouveauMdp(e: React.FormEvent) {
    e.preventDefault();
    setResetErreur("");
    if (resetMdp.length < 6) {
      setResetErreur("Mot de passe : 6 caractères minimum.");
      return;
    }
    if (resetMdp !== resetMdp2) {
      setResetErreur("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    if (!user?.email) return;
    setResetEnvoi(true);
    const { error: errCode } = await supabase.auth.verifyOtp({
      email: user.email,
      token: resetCode.trim(),
      type: "recovery",
    });
    if (errCode) {
      setResetEnvoi(false);
      setResetErreur("Code incorrect ou expiré. Renvoie un code et réessaie.");
      return;
    }
    const { error: errPwd } = await supabase.auth.updateUser({
      password: resetMdp,
    });
    setResetEnvoi(false);
    if (errPwd) {
      setResetErreur("Impossible d'enregistrer le mot de passe. Réessaie.");
      return;
    }
    setResetOk(true);
    setResetEnvoye(false);
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-ink/60">
        Un instant…
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-40 pt-5">
      {message && (
        <div
          className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-4 py-2 text-center text-sm font-medium text-white shadow-lg"
          style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)", maxWidth: "90vw" }}
        >
          <Check className="h-4 w-4 shrink-0" strokeWidth={3} /> {message}
        </div>
      )}
      <AppHeader />

      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/parametres")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Réglages
        </button>

        <h1 className="font-display text-3xl font-bold">Paramètres du compte</h1>
        <p className="mt-1 mb-6 text-ink/60">
          Ton adresse email, ton téléphone et ton mot de passe.
        </p>

        <div className="space-y-6">
          {/* Email */}
          <Bloc icone={<AtSign className="h-5 w-5 text-violet" />} titre="Adresse email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@email.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={champ}
            />
          </Bloc>

          {/* Téléphone */}
          <Bloc icone={<Phone className="h-5 w-5 text-bleu" />} titre="Numéro de téléphone">
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className={champ}
            />
            <p className="mt-2 text-xs text-ink/40">
              Toujours enregistré sur ton compte.
            </p>
          </Bloc>

          {/* Mot de passe */}
          <Bloc icone={<Lock className="h-5 w-5 text-violet" />} titre="Mot de passe">
            {resetOk ? (
              <p className="flex items-start gap-2 text-sm text-ink/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-bleu" strokeWidth={3} />
                Mot de passe modifié ✓
              </p>
            ) : resetEnvoye ? (
              <form onSubmit={validerNouveauMdp} className="space-y-3">
                <p className="text-sm text-ink/70">
                  Un code a été envoyé à{" "}
                  <span className="font-medium text-ink">{user.email}</span>{" "}
                  (pense aux spams). Saisis-le puis choisis ton nouveau mot de passe.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Code à 6 chiffres"
                  className="w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-2.5 text-center text-lg tracking-[0.3em] text-ink placeholder:text-ink/30 placeholder:tracking-normal focus:border-pink focus:outline-none"
                />
                <input
                  type="password"
                  required
                  value={resetMdp}
                  onChange={(e) => setResetMdp(e.target.value)}
                  placeholder="Nouveau mot de passe (6+ caractères)"
                  className="w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-2.5 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
                />
                <input
                  type="password"
                  required
                  value={resetMdp2}
                  onChange={(e) => setResetMdp2(e.target.value)}
                  placeholder="Confirme le mot de passe"
                  className="w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-2.5 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
                />
                {resetErreur && <p className="text-sm text-pink-light">{resetErreur}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={resetEnvoi}
                    className="bg-metal rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {resetEnvoi ? "Un instant…" : "Changer le mot de passe"}
                  </button>
                  <button
                    type="button"
                    onClick={demanderResetMdp}
                    disabled={resetEnvoi}
                    className="text-sm text-pink-light hover:underline disabled:opacity-60"
                  >
                    Renvoyer un code
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-sm text-ink/70">
                  Pour ta sécurité, on t&apos;envoie un code par email&nbsp;: tu le
                  saisis ici, puis tu choisis ton nouveau mot de passe.
                </p>
                <button
                  onClick={demanderResetMdp}
                  disabled={resetEnvoi}
                  className="bg-metal mt-3 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {resetEnvoi ? "Envoi…" : "Recevoir un code par email"}
                </button>
                {resetErreur && <p className="mt-2 text-sm text-pink-light">{resetErreur}</p>}
              </>
            )}
          </Bloc>

          {erreur && (
            <p className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-2 text-sm text-ink/80">
              <AlertCircle className="h-4 w-4" /> {erreur}
            </p>
          )}

          <button
            onClick={enregistrer}
            disabled={enCours}
            className="bg-metal glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {enCours ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </main>
  );
}

const champ =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";

function Bloc({
  icone,
  titre,
  children,
}: {
  icone: React.ReactNode;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4">
      <div className="mb-2 flex items-center gap-2">
        {icone}
        <h2 className="font-display text-xl font-bold">{titre}</h2>
      </div>
      {children}
    </div>
  );
}

function traduire(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("should be different"))
    return "Choisis un mot de passe différent de l'actuel.";
  if (m.includes("rate") || m.includes("limit"))
    return "Trop d'essais, patiente une minute.";
  if (m.includes("already") || m.includes("registered"))
    return "Cet email est déjà utilisé.";
  return "Une erreur est survenue : " + msg;
}
