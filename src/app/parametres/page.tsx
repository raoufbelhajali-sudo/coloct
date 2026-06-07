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
  Repeat,
  ShieldCheck,
  ArrowLeft,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import RolePin from "@/components/RolePin";
import AppHeader from "@/components/AppHeader";

export default function ParametresPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [resetEnvoi, setResetEnvoi] = useState(false);
  const [resetEnvoye, setResetEnvoye] = useState(false);
  const [resetErreur, setResetErreur] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPerm, setNotifPerm] = useState<string>("default");
  const [idEnCours, setIdEnCours] = useState(false);
  const [idErreur, setIdErreur] = useState("");

  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);
  const [supprEnCours, setSupprEnCours] = useState(false);

  const retour = profile?.role === "locataire" ? "/locataire" : "/swipe";
  const estAnnonceur = profile?.role === "locataire";

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
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPerm(Notification.permission);
    } else {
      setNotifPerm("unsupported");
    }
  }, [loading, user, profile, router]);

  // Un seul enregistrement pour toute la page
  async function enregistrer() {
    if (!user) return;
    setErreur("");
    setMessage("");

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
      data: Record<string, unknown>;
    } = {
      data: { telephone: telephone.trim(), notif_email: notifEmail },
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
  }

  // Envoie un lien de changement de mot de passe à l'email du compte
  async function demanderResetMdp() {
    if (!user?.email) return;
    setResetEnvoi(true);
    setResetErreur("");
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });
    setResetEnvoi(false);
    if (error) setResetErreur("Échec de l'envoi. Réessaie dans un instant.");
    else setResetEnvoye(true);
  }

  async function deconnexion() {
    await signOut();
    router.push("/");
  }

  // Téléverse la pièce d'identité (stockage privé) → badge "Identité vérifiée"
  async function televerserIdentite(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIdEnCours(true);
    setIdErreur("");
    const ext = file.name.split(".").pop() || "jpg";
    const chemin = `${user.id}/piece-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("identites")
      .upload(chemin, file, { upsert: true });
    if (error) {
      setIdEnCours(false);
      setIdErreur("Échec de l'envoi. Réessaie.");
      return;
    }
    await supabase
      .from("profiles")
      .update({ identite_verifiee: true })
      .eq("id", user.id);
    await refreshProfile();
    setIdEnCours(false);
    e.target.value = "";
  }

  // Changer de mode (Annonceur ↔ Colocataire) sur le même compte
  async function changerRole() {
    if (!user) return;
    const nouveau = estAnnonceur ? "colocataire" : "locataire";
    await supabase.from("profiles").update({ role: nouveau }).eq("id", user.id);
    await refreshProfile();
    router.push(nouveau === "locataire" ? "/locataire" : "/swipe");
  }

  // Autoriser les notifications système sur cet appareil/navigateur
  async function activerNotifsAppareil() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPerm("unsupported");
      return;
    }
    const p = await Notification.requestPermission();
    setNotifPerm(p);
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
    <main className="flex min-h-dvh flex-col items-center px-4 pb-40 pt-6">
      {/* Barre de navigation du bas (toujours visible) */}
      <AppHeader hideTop />
      <header className="mb-6 flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={retour}>
            <LogoMark className="h-7 w-7" />
          </Link>
          <RolePin />
        </div>
        <Link
          href={retour}
          aria-label="Retour"
          title="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-pink"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Paramètres</h1>
        <p className="mt-1 mb-6 text-ink/60">
          Gère ton compte et tes préférences.
        </p>

        <div className="space-y-6">
          {/* Modifier mon profil (première ligne) */}
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-2xl bg-panel p-4 transition-colors hover:bg-panel-2"
          >
            <span className="bg-signature flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <UserRound className="h-5 w-5 text-white" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-lg font-semibold">
                Modifier mon profil
              </span>
              <span className="block text-sm text-ink/55">
                Photo, infos, centres d&apos;intérêt, mode de vie…
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink/40" />
          </Link>

          {/* Mode (rôle) */}
          <Bloc
            icone={<Repeat className="h-5 w-5 text-violet" />}
            titre="Mode"
          >
            <p className="text-sm text-ink/70">
              Tu es actuellement :{" "}
              <span className="font-semibold text-ink">
                {estAnnonceur ? "Annonceur (je propose un logement)" : "Colocataire (je cherche)"}
              </span>
            </p>
            <button
              onClick={changerRole}
              className="bg-signature mt-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
            >
              <Repeat className="h-4 w-4" />
              Passer en mode {estAnnonceur ? "Colocataire" : "Annonceur"}
            </button>
            <p className="mt-2 text-xs text-ink/40">
              Tes infos des deux côtés sont conservées (ton annonce et ton profil de recherche).
            </p>
          </Bloc>

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

          {/* Mot de passe — changement sécurisé par lien email */}
          <Bloc
            icone={<Lock className="h-5 w-5 text-violet" />}
            titre="Mot de passe"
          >
            {resetEnvoye ? (
              <p className="flex items-start gap-2 text-sm text-ink/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink" strokeWidth={3} />
                Lien envoyé à <span className="font-medium text-ink">{user.email}</span>.
                Ouvre l&apos;email et clique sur le lien pour choisir ton nouveau
                mot de passe (pense à regarder les spams).
              </p>
            ) : (
              <>
                <p className="text-sm text-ink/70">
                  Pour ta sécurité, le changement de mot de passe se fait via un
                  lien envoyé à ton email.
                </p>
                <button
                  onClick={demanderResetMdp}
                  disabled={resetEnvoi}
                  className="bg-signature mt-3 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {resetEnvoi ? "Envoi…" : "Recevoir un lien par email"}
                </button>
                {resetErreur && (
                  <p className="mt-2 text-sm text-pink-light">{resetErreur}</p>
                )}
              </>
            )}
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

          {/* Notifications sur l'appareil (système) */}
          <Bloc
            icone={<Bell className="h-5 w-5 text-violet" />}
            titre="Notifications sur cet appareil"
          >
            <p className="text-sm text-ink/70">
              Reçois une alerte quand tu as un nouveau message.
            </p>
            {notifPerm === "granted" ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-pink">
                <Check className="h-4 w-4" strokeWidth={3} /> Notifications
                activées
              </p>
            ) : notifPerm === "denied" ? (
              <p className="mt-2 text-sm text-ink/60">
                Notifications bloquées. Réactive-les dans les réglages de ton
                navigateur/téléphone pour cette app.
              </p>
            ) : notifPerm === "unsupported" ? (
              <p className="mt-2 text-sm text-ink/60">
                Ton navigateur ne gère pas les notifications.
              </p>
            ) : (
              <button
                onClick={activerNotifsAppareil}
                className="bg-signature mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white"
              >
                Activer les notifications
              </button>
            )}
          </Bloc>

          {/* Vérification d'identité */}
          <Bloc
            icone={<ShieldCheck className="h-5 w-5 text-violet" />}
            titre="Vérification d'identité"
          >
            {profile?.identite_verifiee ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-pink">
                <Check className="h-4 w-4" strokeWidth={3} /> Identité vérifiée
              </p>
            ) : (
              <>
                <p className="text-sm text-ink/70">
                  Téléverse ta pièce d&apos;identité pour obtenir le badge
                  «&nbsp;Identité vérifiée&nbsp;».
                </p>
                <label className="bg-signature mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4" />
                  {idEnCours ? "Envoi…" : "Téléverser ma pièce d'identité"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={televerserIdentite}
                    disabled={idEnCours}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-ink/40">
                  Document privé et sécurisé, visible seulement par toi et
                  l&apos;équipe.
                </p>
                {idErreur && (
                  <p className="mt-2 text-sm text-pink-light">{idErreur}</p>
                )}
              </>
            )}
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
