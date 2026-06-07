"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LogoMark } from "@/components/Logo";

// Page atteinte via le lien de réinitialisation reçu par email.
// Supabase ouvre automatiquement une session de récupération à l'arrivée.
export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [pret, setPret] = useState(false); // lien valide / session de récupération ok
  const [verif, setVerif] = useState(true); // vérification en cours
  const [mdp, setMdp] = useState("");
  const [confirm, setConfirm] = useState("");
  const [erreur, setErreur] = useState("");
  const [ok, setOk] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    // Le lien email crée une session de récupération (événement PASSWORD_RECOVERY)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setPret(true);
        setVerif(false);
      }
    });
    // Au cas où la session est déjà là au chargement
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPret(true);
      setVerif(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (mdp.length < 6) {
      setErreur("Mot de passe : 6 caractères minimum.");
      return;
    }
    if (mdp !== confirm) {
      setErreur("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setEnCours(true);
    const { error } = await supabase.auth.updateUser({ password: mdp });
    setEnCours(false);
    if (error) {
      setErreur("Impossible de changer le mot de passe. Le lien a peut-être expiré — redemande-en un.");
      return;
    }
    setOk(true);
    setTimeout(() => router.replace("/parametres"), 1800);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <LogoMark className="mb-3 h-12 w-12" />
      <div className="w-full max-w-sm rounded-3xl bg-panel p-6">
        {ok ? (
          <div className="space-y-3 text-center">
            <div className="bg-signature mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </div>
            <p className="font-display text-xl">Mot de passe modifié !</p>
            <p className="text-sm text-ink/70">On te redirige…</p>
          </div>
        ) : verif ? (
          <p className="text-center text-ink/60">Vérification du lien…</p>
        ) : !pret ? (
          <div className="space-y-3 text-center">
            <Lock className="mx-auto h-10 w-10 text-pink" />
            <p className="font-display text-xl">Lien invalide ou expiré</p>
            <p className="text-sm text-ink/70">
              Ce lien n&apos;est plus valable. Retourne dans Paramètres pour
              redemander un lien de changement de mot de passe.
            </p>
          </div>
        ) : (
          <form onSubmit={enregistrer} className="space-y-4">
            <div className="text-center">
              <Lock className="mx-auto h-10 w-10 text-pink" />
              <p className="mt-2 font-display text-xl">Nouveau mot de passe</p>
            </div>
            <div>
              <label className="text-sm text-ink/70">Nouveau mot de passe</label>
              <input
                type="password"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                placeholder="Au moins 6 caractères"
                autoFocus
                className={champ}
              />
            </div>
            <div>
              <label className="text-sm text-ink/70">Confirme le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Retape le même"
                className={champ}
              />
            </div>
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
              {enCours ? "Un instant…" : "Changer mon mot de passe"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const champ =
  "mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";
