"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { Monitor } from "lucide-react";
import {
  ShieldCheck, Users, FileText, Eye, Check, Snowflake, Trash2, ArrowLeft, Lock,
  LayoutDashboard, Flag, Star, BadgeCheck, Ban, UserCog, KeyRound,
} from "lucide-react";
import { useAuth, type Profile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  getTousProfils, definirIdentiteVerifiee, getPieceIdentiteUrl, suspendreProfil,
  getToutesAnnonces, gelerAnnonce, supprimerAnnonce,
  getStats, getVerifsEnAttente, getSignalements, supprimerSignalement,
  getAvis, supprimerAvis,
  sha256, getBoHash, setBoHash,
  type AdminStats, type Signalement, type AvisAdmin,
} from "@/lib/admin";
import type { Listing } from "@/data/listings";

type Onglet = "dash" | "users" | "annonces" | "verifs" | "reports" | "avis" | "compte";

// Connexion back-office par lien magique — réservée à UNE seule adresse.
const ADMIN_EMAIL = "raoufbelhajali@gmail.com";

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const estAdmin = !!profile?.is_admin;

  const [onglet, setOnglet] = useState<Onglet>("dash");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [profils, setProfils] = useState<Profile[]>([]);
  const [annonces, setAnnonces] = useState<Listing[]>([]);
  const [verifs, setVerifs] = useState<Profile[]>([]);
  const [reports, setReports] = useState<Signalement[]>([]);
  const [avis, setAvis] = useState<AvisAdmin[]>([]);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  // --- Verrou mot de passe back-office ---
  // Désactivé : on entre directement après la connexion email (réservée à
  // l'adresse admin) + le flag is_admin. Plus de 2e mot de passe.
  const [boOk, setBoOk] = useState(true);
  const [boHash, setBoHashState] = useState<string | null>(null);
  const [boCharge, setBoCharge] = useState(false);
  const [mdp, setMdp] = useState("");
  const [mdp2, setMdp2] = useState("");
  const [boErreur, setBoErreur] = useState("");

  useEffect(() => {
    if (!estAdmin || !user) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("flatswiper_bo_ok") === "1") {
      setBoOk(true);
      return;
    }
    getBoHash(user.id).then((h) => {
      setBoHashState(h);
      setBoCharge(true);
    });
  }, [estAdmin, user]);

  async function definirMdp(e: React.FormEvent) {
    e.preventDefault();
    setBoErreur("");
    if (mdp.length < 4) return setBoErreur("Au moins 4 caractères.");
    if (mdp !== mdp2) return setBoErreur("Les mots de passe ne correspondent pas.");
    if (!user) return;
    await setBoHash(user.id, await sha256(mdp));
    sessionStorage.setItem("flatswiper_bo_ok", "1");
    setBoOk(true);
  }
  async function entrerMdp(e: React.FormEvent) {
    e.preventDefault();
    setBoErreur("");
    if ((await sha256(mdp)) === boHash) {
      sessionStorage.setItem("flatswiper_bo_ok", "1");
      setBoOk(true);
    } else {
      setBoErreur("Mot de passe incorrect.");
    }
  }
  // Mot de passe oublié : l'admin (déjà connecté par lien magique) le réinitialise
  async function oublierMdp() {
    if (!user) return;
    await setBoHash(user.id, ""); // efface → repasse en création
    setBoHashState(null);
    setMdp("");
    setBoErreur("");
  }

  // Connexion back-office par lien magique
  const [emailLog, setEmailLog] = useState("");
  const [code, setCode] = useState("");
  const [logErreur, setLogErreur] = useState("");
  const [logEnCours, setLogEnCours] = useState(false);
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  async function connexion(e: React.FormEvent) {
    e.preventDefault();
    setLogErreur("");
    const email = emailLog.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setLogErreur("Adresse mail non valide.");
      return;
    }
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setLogErreur("Accès refusé : cette adresse n'est pas autorisée.");
      return;
    }
    setLogEnCours(true);
    const { error } = await supabase.auth.signInWithOtp({ email: emailLog.trim() });
    setLogEnCours(false);
    if (error) setLogErreur("Impossible d'envoyer le code. Réessaie.");
    else setCodeEnvoye(true);
  }
  // Vérifie le code à 6 chiffres reçu par email (login existant ou inscription)
  async function verifierCode(e: React.FormEvent) {
    e.preventDefault();
    setLogErreur("");
    setLogEnCours(true);
    const email = emailLog.trim().toLowerCase();
    let { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) {
      const retry = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
      error = retry.error;
    }
    setLogEnCours(false);
    if (error) setLogErreur("Code incorrect ou expiré.");
    // Succès → user défini → estAdmin → verrou mot de passe back-office.
  }

  const charger = useCallback(async () => {
    if (!estAdmin) return;
    setChargement(true);
    const [s, p, a, v, r, av] = await Promise.all([
      getStats(), getTousProfils(), getToutesAnnonces(),
      getVerifsEnAttente(), getSignalements(), getAvis(),
    ]);
    setStats(s); setProfils(p); setAnnonces(a);
    setVerifs(v); setReports(r); setAvis(av);
    setChargement(false);
  }, [estAdmin]);

  useEffect(() => {
    if (estAdmin) charger();
  }, [estAdmin, charger]);

  async function basculerVerif(p: Profile) {
    await definirIdentiteVerifiee(p.id, !p.identite_verifiee);
    const maj = (x: Profile) => (x.id === p.id ? { ...x, identite_verifiee: !p.identite_verifiee } : x);
    setProfils((prev) => prev.map(maj));
    setVerifs((prev) => prev.filter((x) => x.id !== p.id)); // sort de la file d'attente
  }
  async function voirPiece(userId: string) {
    const url = await getPieceIdentiteUrl(userId);
    if (url) window.open(url, "_blank");
    else alert("Aucune pièce d'identité déposée par cet utilisateur.");
  }
  async function basculerSuspension(p: Profile) {
    await suspendreProfil(p.id, !p.suspendu);
    setProfils((prev) => prev.map((x) => (x.id === p.id ? { ...x, suspendu: !p.suspendu } : x)));
  }
  async function geler(a: Listing) {
    await gelerAnnonce(a.id, !a.gelee);
    setAnnonces((prev) => prev.map((x) => (x.id === a.id ? { ...x, gelee: !a.gelee } : x)));
  }
  async function supprimer(a: Listing) {
    if (!confirm(`Supprimer définitivement l'annonce "${a.titre || a.ville}" ?`)) return;
    await supprimerAnnonce(a.id);
    setAnnonces((prev) => prev.filter((x) => x.id !== a.id));
  }
  async function retirerReport(s: Signalement) {
    await supprimerSignalement(s.id);
    setReports((prev) => prev.filter((x) => x.id !== s.id));
  }
  async function retirerAvis(a: AvisAdmin) {
    if (!confirm("Supprimer cet avis ?")) return;
    await supprimerAvis(a.reviewerId, a.reviewedId);
    setAvis((prev) => prev.filter((x) => !(x.reviewerId === a.reviewerId && x.reviewedId === a.reviewedId)));
  }

  // Mon compte : changer le mot de passe back-office
  const [boNew, setBoNew] = useState("");
  const [boNew2, setBoNew2] = useState("");
  const [compteMsg, setCompteMsg] = useState("");
  async function changerMdpBo(e: React.FormEvent) {
    e.preventDefault();
    setCompteMsg("");
    if (boNew.length < 4) return setCompteMsg("Au moins 4 caractères.");
    if (boNew !== boNew2) return setCompteMsg("Les mots de passe ne correspondent pas.");
    if (!user) return;
    await setBoHash(user.id, await sha256(boNew));
    setBoNew("");
    setBoNew2("");
    setCompteMsg("✅ Mot de passe back-office mis à jour.");
  }

  // --- Garde d'accès ---
  if (loading) {
    return <main className="flex min-h-dvh items-center justify-center text-ink/60">Chargement…</main>;
  }
  if (native) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Monitor className="h-12 w-12 text-violet" />
        <h1 className="font-display text-2xl font-bold">Back-office sur ordinateur</h1>
        <p className="max-w-xs text-sm text-ink/70">
          L&apos;espace d&apos;administration s&apos;utilise depuis un ordinateur, sur
          flatswiper.com/admyn.
        </p>
        <Link href="/" className="bg-metal rounded-full px-6 py-3 font-semibold text-white">
          Retour
        </Link>
      </main>
    );
  }
  // Pas connecté → connexion du back-office par lien magique (email admin)
  if (!user) {
    const champ =
      "w-full rounded-xl border border-ink/10 bg-panel px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
        <div className="bg-signature flex h-14 w-14 items-center justify-center rounded-2xl">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold">Connexion back-office</h1>
        {codeEnvoye ? (
          <form onSubmit={verifierCode} className="w-full max-w-xs space-y-3">
            <p className="text-center text-sm text-ink/75">
              📧 Un code à 6 chiffres a été envoyé à <strong>{emailLog}</strong>.
            </p>
            <input
              type="text" inputMode="numeric" value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code à 6 chiffres" autoFocus
              className={champ + " text-center text-lg tracking-[0.4em]"}
            />
            <button disabled={logEnCours} className="bg-metal w-full rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60">
              {logEnCours ? "Vérification…" : "Valider le code"}
            </button>
            {logErreur && <p className="text-center text-sm font-medium text-pink">{logErreur}</p>}
            <button
              type="button"
              onClick={() => { setCodeEnvoye(false); setCode(""); setLogErreur(""); }}
              className="block w-full text-center text-sm text-ink/55 hover:underline"
            >
              Renvoyer / changer d&apos;email
            </button>
          </form>
        ) : (
          <form onSubmit={connexion} noValidate className="w-full max-w-xs space-y-3">
            <p className="text-center text-sm text-ink/65">
              Saisis ton adresse admin : tu recevras un code par email.
            </p>
            <input
              type="email" value={emailLog} onChange={(e) => setEmailLog(e.target.value)}
              placeholder="Email" autoFocus autoComplete="username" className={champ}
            />
            <button disabled={logEnCours} className="bg-metal w-full rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60">
              {logEnCours ? "Envoi…" : "Recevoir le code"}
            </button>
            {logErreur && <p className="text-center text-sm font-medium text-pink">{logErreur}</p>}
          </form>
        )}
      </main>
    );
  }
  if (!estAdmin) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Lock className="h-12 w-12 text-violet" />
        <h1 className="font-display text-2xl font-bold">Accès réservé</h1>
        <p className="max-w-xs text-sm text-ink/70">
          Cette page d&apos;administration est réservée à l&apos;équipe FlatSwiper.
        </p>
        <Link href="/" className="bg-metal rounded-full px-6 py-3 font-semibold text-white">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  // --- Porte mot de passe back-office ---
  if (!boOk) {
    const champ =
      "w-full rounded-xl border border-ink/10 bg-panel px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none";
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
        <div className="bg-signature flex h-14 w-14 items-center justify-center rounded-2xl">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold">Back-office</h1>
        {!boCharge ? (
          <p className="text-ink/60">Chargement…</p>
        ) : boHash ? (
          <form onSubmit={entrerMdp} className="w-full max-w-xs space-y-3">
            <p className="text-center text-sm text-ink/65">Entre ton mot de passe back-office.</p>
            <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)}
              placeholder="Mot de passe" autoFocus className={champ} />
            <button className="bg-metal w-full rounded-full px-6 py-3 font-semibold text-white">
              Se connecter
            </button>
            <button type="button" onClick={oublierMdp}
              className="block w-full text-center text-xs text-ink/55 hover:underline">
              Mot de passe oublié ? Le réinitialiser
            </button>
          </form>
        ) : (
          <form onSubmit={definirMdp} className="w-full max-w-xs space-y-3">
            <p className="text-center text-sm text-ink/65">
              Première connexion : crée le mot de passe d&apos;accès au back-office.
            </p>
            <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)}
              placeholder="Nouveau mot de passe" autoFocus className={champ} />
            <input type="password" value={mdp2} onChange={(e) => setMdp2(e.target.value)}
              placeholder="Confirme le mot de passe" className={champ} />
            <button className="bg-metal w-full rounded-full px-6 py-3 font-semibold text-white">
              Créer le mot de passe
            </button>
          </form>
        )}
        {boErreur && <p className="text-sm font-medium text-pink">{boErreur}</p>}
      </main>
    );
  }

  const profilsFiltres = profils.filter((p) => {
    const q = recherche.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.prenom || "").toLowerCase().includes(q) ||
      (p.pseudo || "").toLowerCase().includes(q) ||
      (p.ville || "").toLowerCase().includes(q)
    );
  });

  const onglets: { id: Onglet; label: string; Icon: typeof Users; badge?: number }[] = [
    { id: "dash", label: "Tableau de bord", Icon: LayoutDashboard },
    { id: "users", label: "Utilisateurs", Icon: Users, badge: profils.length },
    { id: "annonces", label: "Annonces", Icon: FileText, badge: annonces.length },
    { id: "verifs", label: "Vérifications", Icon: BadgeCheck, badge: verifs.length },
    { id: "reports", label: "Signalements", Icon: Flag, badge: reports.length },
    { id: "avis", label: "Avis", Icon: Star, badge: avis.length },
    { id: "compte", label: "Mon compte", Icon: UserCog },
  ];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[1600px] px-4 py-8 sm:px-8">
      <header className="mb-6 flex items-center gap-3">
        <Link href="/parametres" className="text-ink/60 hover:text-ink">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <ShieldCheck className="h-7 w-7 text-violet" /> Back-office
        </h1>
        <span className="ml-auto text-sm text-ink/50">FlatSwiper · administration</span>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navigation : barre horizontale sur petit écran, colonne sur PC */}
        <nav className="flex flex-wrap gap-2 lg:w-60 lg:shrink-0 lg:flex-col lg:flex-nowrap lg:gap-1">
          {onglets.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setOnglet(id)}
              className={
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors lg:w-full lg:justify-start " +
                (onglet === id ? "bg-signature text-white" : "bg-panel text-ink/70 hover:bg-panel-2")
              }
            >
              <Icon className="h-4 w-4 shrink-0" /> {label}
              {badge != null && (
                <span className={"ml-auto rounded-full px-1.5 text-[11px] " + (onglet === id ? "bg-white/25" : "bg-panel-2")}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
      {chargement ? (
        <p className="text-ink/60">Chargement des données…</p>
      ) : onglet === "dash" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Utilisateurs" valeur={stats?.users} />
          <Stat label="Annonceurs" valeur={stats?.annonceurs} />
          <Stat label="Co/locataires" valeur={stats?.colocataires} />
          <Stat label="Annonces" valeur={stats?.annonces} />
          <Stat label="Matchs" valeur={stats?.matchs} />
          <Stat label="Signalements" valeur={stats?.signalements} accent />
          <Stat label="Avis" valeur={stats?.avis} />
        </div>
      ) : onglet === "users" ? (
        <div className="space-y-2">
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher (prénom, pseudo, ville)…"
            className="mb-2 w-full rounded-full border border-ink/10 bg-panel px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          {profilsFiltres.map((p) => (
            <LigneUser
              key={p.id} p={p}
              onVerif={() => basculerVerif(p)}
              onVoir={() => voirPiece(p.id)}
              onSuspendre={() => basculerSuspension(p)}
            />
          ))}
        </div>
      ) : onglet === "annonces" ? (
        <div className="space-y-2">
          {annonces.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-panel p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-panel-2">
                {a.photos?.[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={a.photos[0]} alt={a.titre || ""} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {a.titre || "Annonce"}{" "}
                  {a.gelee && <span className="text-[11px] font-medium text-violet">· en pause</span>}
                </p>
                <p className="truncate text-xs text-ink/55">
                  {[a.ville, a.quartier, a.loyer ? `${a.loyer} €/mois` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <IconBtn title={a.gelee ? "Réactiver" : "Mettre en pause"} onClick={() => geler(a)}>
                {a.gelee ? <Check className="h-4 w-4" /> : <Snowflake className="h-4 w-4" />}
              </IconBtn>
              <IconBtn title="Supprimer" danger onClick={() => supprimer(a)}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
        </div>
      ) : onglet === "verifs" ? (
        <div className="space-y-2">
          {verifs.length === 0 ? (
            <p className="text-ink/60">Aucune vérification en attente. 🎉</p>
          ) : (
            verifs.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-panel p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.prenom || p.pseudo || "—"}</p>
                  <p className="truncate text-xs text-ink/55">{p.ville || "—"}</p>
                </div>
                <button onClick={() => voirPiece(p.id)} className="flex items-center gap-1.5 rounded-full bg-panel-2 px-3 py-2 text-xs font-semibold text-ink/80">
                  <Eye className="h-4 w-4" /> Voir la pièce
                </button>
                <button onClick={() => basculerVerif(p)} className="bg-metal rounded-full px-3 py-2 text-xs font-semibold text-white">
                  Valider
                </button>
              </div>
            ))
          )}
        </div>
      ) : onglet === "reports" ? (
        <div className="space-y-2">
          {reports.length === 0 ? (
            <p className="text-ink/60">Aucun signalement. 🎉</p>
          ) : (
            reports.map((s) => (
              <div key={s.id} className="rounded-2xl bg-panel p-3">
                <div className="flex items-start gap-2">
                  <Flag className="mt-0.5 h-4 w-4 shrink-0 text-pink" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.raison}</p>
                    <p className="text-xs text-ink/55">
                      <strong>{s.auteur}</strong> a signalé <strong>{s.vise}</strong>
                    </p>
                    {s.details && <p className="mt-1 text-sm text-ink/75">{s.details}</p>}
                  </div>
                  <IconBtn title="Marquer comme traité" onClick={() => retirerReport(s)}>
                    <Check className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            ))
          )}
        </div>
      ) : onglet === "avis" ? (
        <div className="space-y-2">
          {avis.length === 0 ? (
            <p className="text-ink/60">Aucun avis.</p>
          ) : (
            avis.map((a) => (
              <div key={a.reviewerId + a.reviewedId} className="rounded-2xl bg-panel p-3">
                <div className="flex items-start gap-2">
                  <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
                    <Star className="h-4 w-4" fill="currentColor" />
                    <span className="text-sm font-bold text-ink">{a.note}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink/55">
                      <strong>{a.auteur}</strong> → <strong>{a.vise}</strong>
                    </p>
                    {a.commentaire && <p className="mt-1 text-sm text-ink/80">{a.commentaire}</p>}
                  </div>
                  <IconBtn title="Supprimer l'avis" danger onClick={() => retirerAvis(a)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="max-w-md space-y-4">
          <div className="rounded-2xl bg-panel p-4">
            <p className="flex items-center gap-2 text-xs text-ink/50">
              <UserCog className="h-4 w-4" /> Compte administrateur
            </p>
            <p className="mt-1 font-semibold">{user?.email}</p>
          </div>

          <form onSubmit={changerMdpBo} className="space-y-3 rounded-2xl bg-panel p-4">
            <p className="flex items-center gap-2 font-medium">
              <KeyRound className="h-4 w-4 text-violet" /> Mot de passe back-office
            </p>
            <input
              type="password" value={boNew} onChange={(e) => setBoNew(e.target.value)}
              placeholder="Nouveau mot de passe" autoComplete="new-password"
              className="w-full rounded-xl border border-ink/10 bg-panel-2 px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
            />
            <input
              type="password" value={boNew2} onChange={(e) => setBoNew2(e.target.value)}
              placeholder="Confirme le nouveau mot de passe" autoComplete="new-password"
              className="w-full rounded-xl border border-ink/10 bg-panel-2 px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
            />
            <button className="bg-metal w-full rounded-full px-6 py-3 font-semibold text-white">
              Enregistrer
            </button>
            {compteMsg && (
              <p className={"text-sm font-medium " + (compteMsg.startsWith("✅") ? "text-violet" : "text-pink")}>
                {compteMsg}
              </p>
            )}
          </form>

          <button
            onClick={() => {
              sessionStorage.removeItem("flatswiper_bo_ok");
              supabase.auth.signOut();
            }}
            className="w-full rounded-full border border-ink/15 bg-panel-2 px-6 py-3 text-sm font-semibold text-ink"
          >
            Se déconnecter du back-office
          </button>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, valeur, accent }: { label: string; valeur?: number; accent?: boolean }) {
  return (
    <div className={"rounded-2xl p-4 " + (accent ? "bg-signature text-white" : "bg-panel")}>
      <p className="font-display text-3xl font-bold">{valeur ?? "…"}</p>
      <p className={"text-xs " + (accent ? "text-white/80" : "text-ink/55")}>{label}</p>
    </div>
  );
}

function IconBtn({
  children, title, onClick, danger,
}: {
  children: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 " +
        (danger ? "text-pink hover:bg-pink/10" : "text-ink/70 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function LigneUser({
  p, onVerif, onVoir, onSuspendre,
}: {
  p: Profile; onVerif: () => void; onVoir: () => void; onSuspendre: () => void;
}) {
  return (
    <div className={"flex items-center gap-3 rounded-2xl p-3 " + (p.suspendu ? "bg-pink/10" : "bg-panel")}>
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-panel-2">
        {p.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo_url} alt={p.prenom} className="h-full w-full object-cover" />
        ) : (
          <span className="bg-signature flex h-full w-full items-center justify-center font-bold text-white">
            {p.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {p.prenom || "—"}{" "}
          <span className="text-xs font-normal text-ink/50">
            {p.role === "locataire" ? "· Annonceur" : "· Co/locataire"}
          </span>
          {p.suspendu && <span className="ml-1 text-[11px] font-semibold text-pink">· suspendu</span>}
        </p>
        <p className="truncate text-xs text-ink/55">
          {[p.pseudo ? `@${p.pseudo}` : null, p.ville].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      {p.identite_verifiee && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-bleu-clair px-2 py-1 text-[11px] font-semibold text-violet">
          <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
        </span>
      )}
      <IconBtn title="Voir la pièce d'identité" onClick={onVoir}>
        <Eye className="h-4 w-4" />
      </IconBtn>
      <IconBtn title={p.suspendu ? "Réactiver le compte" : "Suspendre le compte"} danger={!p.suspendu} onClick={onSuspendre}>
        <Ban className="h-4 w-4" />
      </IconBtn>
      <button
        onClick={onVerif}
        className={
          "shrink-0 rounded-full px-3 py-2 text-xs font-semibold " +
          (p.identite_verifiee ? "bg-panel-2 text-ink/70" : "bg-signature text-white")
        }
      >
        {p.identite_verifiee ? "Retirer" : "Valider"}
      </button>
    </div>
  );
}
