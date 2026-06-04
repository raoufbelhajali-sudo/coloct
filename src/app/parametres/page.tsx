"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AtSign,
  Phone,
  Lock,
  Bell,
  LogOut,
  Check,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

export default function ParametresPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);

  // message de retour par section : { cle: "ok" | "texte d'erreur" }
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [enCours, setEnCours] = useState<string>("");

  const retour = profile?.role === "locataire" ? "/locataire" : "/swipe";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    setPseudo(profile?.pseudo ?? "");
    setEmail(user.email ?? "");
    setTelephone(
      user.phone || (typeof meta.telephone === "string" ? meta.telephone : "")
    );
    setNotifEmail(meta.notif_email !== false);
  }, [loading, user, profile, router]);

  function dire(cle: string, message: string) {
    setFeedback((f) => ({ ...f, [cle]: message }));
    if (message === "ok") {
      setTimeout(
        () => setFeedback((f) => ({ ...f, [cle]: "" })),
        2500
      );
    }
  }

  async function sauverPseudo() {
    if (!user) return;
    setEnCours("pseudo");
    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: pseudo.trim() || null })
      .eq("id", user.id);
    await refreshProfile();
    setEnCours("");
    dire("pseudo", error ? "Impossible d'enregistrer." : "ok");
  }

  async function sauverEmail() {
    setEnCours("email");
    const { error } = await supabase.auth.updateUser({
      email: email.trim().toLowerCase(),
    });
    setEnCours("");
    dire(
      "email",
      error
        ? traduire(error.message)
        : "Vérifie ta boîte mail pour confirmer le changement."
    );
  }

  async function sauverTelephone() {
    setEnCours("tel");
    // On stocke le numéro comme info de contact (pas de SMS requis)
    const { error } = await supabase.auth.updateUser({
      data: { telephone: telephone.trim() },
    });
    setEnCours("");
    dire("tel", error ? "Impossible d'enregistrer." : "ok");
  }

  async function sauverMotDePasse() {
    if (motDePasse.length < 6) {
      dire("mdp", "6 caractères minimum.");
      return;
    }
    setEnCours("mdp");
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours("");
    if (error) dire("mdp", traduire(error.message));
    else {
      setMotDePasse("");
      dire("mdp", "ok");
    }
  }

  async function basculerNotif(v: boolean) {
    setNotifEmail(v);
    await supabase.auth.updateUser({ data: { notif_email: v } });
  }

  async function deconnexion() {
    await signOut();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-ink/60">
        Un instant…
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-6">
      <header className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link href={retour}>
          <Logo markClass="h-7 w-7" textClass="text-xl" />
        </Link>
        <Link href={retour} className="text-sm text-ink/60 hover:text-ink">
          Retour
        </Link>
      </header>

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Paramètres</h1>
        <p className="mt-1 mb-6 text-ink/60">
          Gère ton compte et tes préférences.
        </p>

        <div className="space-y-6">
          {/* Pseudo */}
          <Bloc icone={<AtSign className="h-5 w-5 text-pink" />} titre="Pseudo">
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="cam_paris"
              className={champ}
            />
            <Action
              onClick={sauverPseudo}
              enCours={enCours === "pseudo"}
              feedback={feedback.pseudo}
            />
          </Bloc>

          {/* Email */}
          <Bloc
            icone={<AtSign className="h-5 w-5 text-violet" />}
            titre="Adresse email"
          >
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
            <Action
              onClick={sauverEmail}
              enCours={enCours === "email"}
              feedback={feedback.email}
            />
          </Bloc>

          {/* Téléphone */}
          <Bloc
            icone={<Phone className="h-5 w-5 text-pink" />}
            titre="Numéro de téléphone"
          >
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className={champ}
            />
            <Action
              onClick={sauverTelephone}
              enCours={enCours === "tel"}
              feedback={feedback.tel}
            />
          </Bloc>

          {/* Mot de passe */}
          <Bloc
            icone={<Lock className="h-5 w-5 text-violet" />}
            titre="Mot de passe"
          >
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Nouveau mot de passe"
              className={champ}
            />
            <p className="mt-1 text-xs text-ink/40">
              Tu pourras te connecter avec ton email + ce mot de passe.
            </p>
            <Action
              onClick={sauverMotDePasse}
              enCours={enCours === "mdp"}
              feedback={feedback.mdp}
            />
          </Bloc>

          {/* Notifications */}
          <Bloc
            icone={<Bell className="h-5 w-5 text-pink" />}
            titre="Notifications par email"
          >
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-ink/70">
                M&apos;avertir des nouveaux matchs et messages
              </span>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => basculerNotif(e.target.checked)}
                className="accent-pink h-5 w-5"
              />
            </label>
          </Bloc>

          {/* Déconnexion */}
          <button
            onClick={deconnexion}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel px-6 py-3.5 font-medium text-ink/80 hover:border-ink/30"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
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
        <h2 className="font-medium">{titre}</h2>
      </div>
      {children}
    </div>
  );
}

function Action({
  onClick,
  enCours,
  feedback,
}: {
  onClick: () => void;
  enCours: boolean;
  feedback?: string;
}) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={enCours}
        className="bg-signature rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {enCours ? "…" : "Enregistrer"}
      </button>
      {feedback === "ok" && (
        <span className="flex items-center gap-1 text-sm text-pink">
          <Check className="h-4 w-4" strokeWidth={3} /> Enregistré
        </span>
      )}
      {feedback && feedback !== "ok" && (
        <span className="flex items-center gap-1 text-sm text-ink/70">
          <AlertCircle className="h-4 w-4" /> {feedback}
        </span>
      )}
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
