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
  Trash2,
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

  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);
  const [supprEnCours, setSupprEnCours] = useState(false);

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

  // Un seul enregistrement pour toute la page
  async function enregistrer() {
    if (!user) return;
    setErreur("");
    setMessage("");

    if (motDePasse && motDePasse.length < 6) {
      setErreur("Mot de passe : 6 caractères minimum.");
      return;
    }

    setEnCours(true);

    // 1) Pseudo → table profiles
    await supabase
      .from("profiles")
      .update({ pseudo: pseudo.trim() || null })
      .eq("id", user.id);

    // 2) Email / mot de passe / téléphone-contact / notifs → compte
    const emailChange =
      email.trim().toLowerCase() !== (user.email ?? "").toLowerCase();
    const updates: {
      email?: string;
      password?: string;
      data: Record<string, unknown>;
    } = {
      data: { telephone: telephone.trim(), notif_email: notifEmail },
    };
    if (emailChange && email.trim()) updates.email = email.trim().toLowerCase();
    if (motDePasse) updates.password = motDePasse;

    const { error } = await supabase.auth.updateUser(updates);
    await refreshProfile();
    setEnCours(false);

    if (error) {
      setErreur(traduire(error.message));
      return;
    }
    setMotDePasse("");
    setMessage(
      emailChange
        ? "Modifications enregistrées. Vérifie ta boîte mail pour confirmer ton nouvel email."
        : "Modifications enregistrées ✓"
    );
  }

  async function deconnexion() {
    await signOut();
    router.push("/");
  }

  // Supprime définitivement le compte (via la fonction Supabase delete_my_account)
  async function supprimerCompte() {
    setSupprEnCours(true);
    setErreur("");
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setSupprEnCours(false);
      setConfirmSuppr(false);
      setErreur(
        "Suppression impossible pour le moment. (La fonction de suppression doit être activée côté Supabase.)"
      );
      return;
    }
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
              Laisse vide pour ne pas le changer. Sinon, tu pourras te connecter
              avec ton email + ce mot de passe.
            </p>
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
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="accent-pink h-5 w-5"
              />
            </label>
          </Bloc>

          {/* Messages */}
          {message && (
            <p className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-2 text-sm text-pink">
              <Check className="h-4 w-4" strokeWidth={3} /> {message}
            </p>
          )}
          {erreur && (
            <p className="flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-2 text-sm text-ink/80">
              <AlertCircle className="h-4 w-4" /> {erreur}
            </p>
          )}

          {/* Un seul bouton enregistrer */}
          <button
            onClick={enregistrer}
            disabled={enCours}
            className="bg-signature glow-pink w-full rounded-full px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {enCours ? "Enregistrement…" : "Enregistrer"}
          </button>

          {/* Mon compte : déconnexion / suppression */}
          <div className="space-y-3 pt-2">
            <button
              onClick={deconnexion}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel px-6 py-3.5 font-medium text-ink/80 hover:border-ink/30"
            >
              <LogOut className="h-4 w-4" /> Se déconnecter
            </button>

            {!confirmSuppr ? (
              <button
                onClick={() => {
                  setErreur("");
                  setConfirmSuppr(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-pink/30 bg-panel px-6 py-3.5 font-medium text-pink hover:bg-pink/5"
              >
                <Trash2 className="h-4 w-4" /> Supprimer mon profil
              </button>
            ) : (
              <div className="rounded-2xl border border-pink/30 bg-pink/5 p-4 text-center">
                <p className="mb-1 font-medium text-ink">
                  Supprimer définitivement ton profil ?
                </p>
                <p className="mb-3 text-sm text-ink/60">
                  Cette action est irréversible : profil, annonce, matchs et
                  messages seront effacés.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmSuppr(false)}
                    disabled={supprEnCours}
                    className="flex-1 rounded-full border border-ink/15 bg-panel px-4 py-3 font-medium text-ink/80 hover:border-ink/30"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={supprimerCompte}
                    disabled={supprEnCours}
                    className="flex-1 rounded-full bg-pink px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {supprEnCours ? "Suppression…" : "Oui, supprimer"}
                  </button>
                </div>
              </div>
            )}
          </div>
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
