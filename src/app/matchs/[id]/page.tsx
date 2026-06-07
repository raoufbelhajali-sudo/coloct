"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Paperclip, FileText, Download, Mic, X,
  ListChecks, CheckSquare, Square, ChevronDown, MoreVertical, Trash2, Ban, Flag,
  CalendarPlus, CalendarClock, Check,
} from "lucide-react";
import { useAuth, type Profile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ProfileDetail from "@/components/ProfileDetail";
import ListingDetail from "@/components/ListingDetail";
import { getListingById } from "@/lib/listings";
import type { Listing } from "@/data/listings";
import {
  getMessages,
  sendMessage,
  sendDocument,
  sendVoice,
  getDocUrl,
  getMyMatches,
  getMatchInfo,
  setDocumentsRequis,
  getLecture,
  marquerLu,
  proposerVisite,
  accepterVisite,
  MARQUEUR_VISITE,
  MARQUEUR_VISITE_OK,
  TYPES_DOCUMENTS,
  supprimerMatch,
  type Message,
} from "@/lib/messages";
import { marquerMatchLu } from "@/lib/notifications";
import { bloquerUtilisateur } from "@/lib/blocks";
import { signalerUtilisateur, RAISONS_SIGNALEMENT } from "@/lib/reports";
import RolePin from "@/components/RolePin";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = Number(params.id);
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [titre, setTitre] = useState("Conversation");
  const [autrePrenom, setAutrePrenom] = useState("");
  const [autreProfil, setAutreProfil] = useState<Profile | null>(null);
  const [voirProfil, setVoirProfil] = useState(false);
  const [listingMatch, setListingMatch] = useState<Listing | null>(null);
  const [voirAnnonce, setVoirAnnonce] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [envoiDoc, setEnvoiDoc] = useState(false);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({}); // liens des vocaux
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [estLocataire, setEstLocataire] = useState(false);
  const [roleCharge, setRoleCharge] = useState(false);
  const [lecture, setLecture] = useState<{ colocataire: string | null; locataire: string | null }>({ colocataire: null, locataire: null });
  const [signalerOuvert, setSignalerOuvert] = useState(false);
  const [signalEnvoye, setSignalEnvoye] = useState(false);
  const [visiteOuverte, setVisiteOuverte] = useState(false);
  const [visiteDate, setVisiteDate] = useState("");
  const [visiteHeure, setVisiteHeure] = useState("");
  const [visiteLieu, setVisiteLieu] = useState("");
  const [docsRequis, setDocsRequis] = useState<string[]>([]);
  const [checklistOuverte, setChecklistOuverte] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const annuleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Un message est-il un vocal ?
  function estVocal(m: Message) {
    return m.doc_name === "Message vocal";
  }

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  // Titre de la conversation (nom de l'autre / annonce)
  useEffect(() => {
    if (!user) return;
    getMyMatches(user.id).then((ms) => {
      const m = ms.find((x) => x.id === matchId);
      if (m) {
        setTitre(m.titre);
        setAutrePrenom(m.autrePrenom);
        getListingById(m.listingId).then(setListingMatch); // l'annonce du match
      }
    });
  }, [user, matchId]);

  // Ouvrir / consulter la conversation marque ses messages comme lus
  useEffect(() => {
    if (user) marquerMatchLu(user.id, matchId);
  }, [user, matchId, messages]);

  // Accusé de lecture : on note notre lecture côté serveur (quand on connaît le rôle)
  useEffect(() => {
    if (user && roleCharge) marquerLu(matchId, estLocataire);
  }, [user, matchId, messages, estLocataire, roleCharge]);

  // Rôle + documents demandés (checklist)
  useEffect(() => {
    if (!user) return;
    getMatchInfo(matchId).then(async (info) => {
      if (!info) return;
      const jeSuisLoca = info.locataire_id === user.id;
      setEstLocataire(jeSuisLoca);
      setRoleCharge(true);
      setDocsRequis(info.documents_requis);
      // Profil de l'autre personne (annonceur ↔ colocataire), pour pouvoir l'ouvrir
      const autreId = jeSuisLoca ? info.colocataire_id : info.locataire_id;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", autreId)
        .maybeSingle();
      setAutreProfil((data as Profile) ?? null);
    });
  }, [user, matchId]);

  // Supprime la discussion
  async function supprimerDiscussion() {
    if (!confirm("Supprimer cette discussion ? C'est irréversible.")) return;
    await supprimerMatch(matchId);
    router.push("/matchs");
  }

  // Bloque l'autre personne (et supprime la discussion)
  async function bloquer() {
    if (!user || !autreProfil) return;
    if (
      !confirm(
        `Bloquer ${autrePrenom || "cette personne"} ? Vous ne vous verrez plus et la discussion sera supprimée.`
      )
    )
      return;
    await bloquerUtilisateur(user.id, autreProfil.id);
    await supprimerMatch(matchId);
    router.push("/matchs");
  }

  // Propose une visite (date + heure + lieu)
  async function envoyerVisite(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !visiteDate || !visiteHeure) return;
    const iso = new Date(`${visiteDate}T${visiteHeure}`).toISOString();
    await proposerVisite(matchId, user.id, iso, visiteLieu.trim());
    setVisiteOuverte(false);
    setVisiteDate("");
    setVisiteHeure("");
    setVisiteLieu("");
    setMessages(await getMessages(matchId));
  }

  // Le colocataire accepte un créneau proposé
  async function onAccepterVisite(iso: string, lieu: string) {
    if (!user) return;
    await accepterVisite(matchId, user.id, iso, lieu);
    setMessages(await getMessages(matchId));
  }

  // Une visite a-t-elle déjà été acceptée dans cette conversation ?
  const visiteAcceptee = messages.some(
    (m) => m.doc_name === MARQUEUR_VISITE_OK
  );

  // Lien "Ajouter à Google Agenda" pour une visite
  function lienAgenda(iso: string, lieu: string): string {
    const debut = new Date(iso);
    const fin = new Date(debut.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Visite colocation — FlatSwiper",
      dates: `${fmt(debut)}/${fmt(fin)}`,
      details: "Visite organisée via FlatSwiper",
      location: lieu || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // Signale l'autre personne
  async function envoyerSignalement(raison: string) {
    if (!user || !autreProfil) return;
    await signalerUtilisateur(user.id, autreProfil.id, raison);
    setSignalEnvoye(true);
  }

  // Date de lecture de l'AUTRE personne (pour afficher "Vu")
  const autreLuAt = estLocataire ? lecture.colocataire : lecture.locataire;
  // Mon dernier message texte (pour y accrocher le "Vu")
  const monDernierMsgId = [...messages]
    .reverse()
    .find((m) => m.sender_id === user?.id)?.id;

  // Bascule un type de document dans la liste demandée (côté locataire)
  function basculerDoc(type: string) {
    setDocsRequis((prev) => {
      const liste = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      // on enregistre la nouvelle liste (à jour) sur le serveur
      setDocumentsRequis(matchId, liste);
      return liste;
    });
  }

  // Documents déjà fournis (par type)
  const fournis = new Set(
    messages
      .filter((m) => m.doc_name && TYPES_DOCUMENTS.includes(m.doc_name))
      .map((m) => m.doc_name as string)
  );

  // Envoi d'un document tagué à un type (côté colocataire)
  async function envoyerDocType(
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setEnvoiDoc(true);
    const { error } = await sendDocument(matchId, user.id, file, type);
    if (!error) setMessages(await getMessages(matchId));
    setEnvoiDoc(false);
  }

  // Charge les messages, puis rafraîchit toutes les 3 secondes
  useEffect(() => {
    if (!user) return;
    let actif = true;
    const charger = () => {
      getMessages(matchId).then((m) => {
        if (actif) setMessages(m);
      });
      getLecture(matchId).then((l) => {
        if (actif) setLecture(l);
      });
    };
    charger();
    const intervalle = setInterval(charger, 3000);
    return () => {
      actif = false;
      clearInterval(intervalle);
    };
  }, [user, matchId]);

  // Descend en bas à chaque nouveau message
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu || !user) return;
    setTexte("");
    // Affichage immédiat (optimiste)
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random(),
        match_id: matchId,
        sender_id: user.id,
        content: contenu,
        created_at: new Date().toISOString(),
        doc_path: null,
        doc_name: null,
      },
    ]);
    await sendMessage(matchId, user.id, contenu);
  }

  // Joindre un document (fiche de paie, garant…)
  async function joindreDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de renvoyer le même fichier ensuite
    if (!file || !user) return;
    setEnvoiDoc(true);
    const { error } = await sendDocument(matchId, user.id, file);
    if (!error) setMessages(await getMessages(matchId));
    setEnvoiDoc(false);
  }

  // Ouvre un document via un lien temporaire sécurisé
  async function ouvrirDoc(path: string) {
    const url = await getDocUrl(path);
    if (url) window.open(url, "_blank");
  }

  // Récupère les liens d'écoute des messages vocaux
  useEffect(() => {
    const manquants = messages.filter(
      (m) => m.doc_path && estVocal(m) && !docUrls[m.doc_path]
    );
    if (manquants.length === 0) return;
    (async () => {
      const paires = await Promise.all(
        manquants.map(async (m) => [m.doc_path!, await getDocUrl(m.doc_path!)] as const)
      );
      setDocUrls((prev) => {
        const n = { ...prev };
        paires.forEach(([p, u]) => {
          if (u) n[p] = u;
        });
        return n;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Démarre l'enregistrement vocal
  async function demarrerVocal() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      annuleRef.current = false;
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        if (annuleRef.current || !user) return;
        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        if (blob.size > 0) {
          await sendVoice(matchId, user.id, blob);
          setMessages(await getMessages(matchId));
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordSec(0);
      timerRef.current = setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch {
      alert(
        "Micro non autorisé. Autorise l'accès au micro pour envoyer un message vocal."
      );
    }
  }

  // Arrête et envoie le vocal
  function envoyerVocal() {
    annuleRef.current = false;
    mediaRef.current?.stop();
    setRecording(false);
  }

  // Annule l'enregistrement
  function annulerVocal() {
    annuleRef.current = true;
    mediaRef.current?.stop();
    setRecording(false);
  }

  return (
    <main className="flex h-dvh flex-col items-center px-4 py-4">
      {/* En-tête */}
      <header className="flex w-full max-w-sm items-center gap-3 pb-3">
        <Link href="/matchs" className="text-ink/60 hover:text-ink">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <RolePin />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">{titre}</p>
          {autrePrenom && (
            <button
              type="button"
              onClick={() => {
                if (estLocataire) {
                  if (autreProfil) setVoirProfil(true); // annonceur → profil du colocataire
                } else if (listingMatch) {
                  setVoirAnnonce(true); // colocataire → l'annonce (le logement)
                }
              }}
              className="text-sm text-pink hover:underline"
            >
              avec {autrePrenom} ·{" "}
              {estLocataire ? "voir le profil" : "voir l'annonce"}
            </button>
          )}
        </div>

        {/* Menu (supprimer / bloquer) */}
        <div className="relative">
          <button
            onClick={() => setMenuOuvert((v) => !v)}
            aria-label="Options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-panel"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOuvert && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOuvert(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-panel shadow-xl">
                <button
                  onClick={() => {
                    setMenuOuvert(false);
                    supprimerDiscussion();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink/85 hover:bg-panel-2"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer la discussion
                </button>
                <button
                  onClick={() => {
                    setMenuOuvert(false);
                    setSignalEnvoye(false);
                    setSignalerOuvert(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink/85 hover:bg-panel-2"
                >
                  <Flag className="h-4 w-4" /> Signaler {autrePrenom}
                </button>
                <button
                  onClick={() => {
                    setMenuOuvert(false);
                    bloquer();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-pink hover:bg-panel-2"
                >
                  <Ban className="h-4 w-4" /> Bloquer {autrePrenom}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Profil de l'autre personne (clic sur le nom) */}
      {voirProfil && autreProfil && (
        <ProfileDetail
          profile={autreProfil}
          preview
          onClose={() => setVoirProfil(false)}
        />
      )}

      {/* Colocataire : voir l'annonce (le logement) */}
      {voirAnnonce && listingMatch && (
        <ListingDetail
          listing={listingMatch}
          preview
          onClose={() => setVoirAnnonce(false)}
        />
      )}

      {/* Planifier une visite */}
      {visiteOuverte && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setVisiteOuverte(false)}
        >
          <form
            onSubmit={envoyerVisite}
            className="w-full max-w-sm rounded-3xl bg-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 font-display text-xl font-semibold">
                <CalendarClock className="h-5 w-5 text-pink" /> Planifier une visite
              </p>
              <button
                type="button"
                onClick={() => setVisiteOuverte(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-panel-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-ink/70">Date</label>
                <input
                  type="date"
                  required
                  value={visiteDate}
                  onChange={(e) => setVisiteDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink focus:border-pink focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">Heure</label>
                <input
                  type="time"
                  required
                  value={visiteHeure}
                  onChange={(e) => setVisiteHeure(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink focus:border-pink focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-ink/70">
                  Adresse / point de rendez-vous{" "}
                  <span className="text-ink/40">(facultatif)</span>
                </label>
                <input
                  value={visiteLieu}
                  onChange={(e) => setVisiteLieu(e.target.value)}
                  placeholder="ex. devant le 12 rue…"
                  className="mt-1 w-full rounded-lg border border-ink/10 bg-panel-2 px-3 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-signature mt-4 w-full rounded-full px-5 py-3 font-semibold text-white"
            >
              Proposer la visite
            </button>
          </form>
        </div>
      )}

      {/* Signaler un profil */}
      {signalerOuvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSignalerOuvert(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {signalEnvoye ? (
              <div className="text-center">
                <div className="bg-signature mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <p className="font-display text-xl font-semibold">Merci !</p>
                <p className="mt-1 text-sm text-ink/70">
                  Ton signalement a bien été envoyé. Notre équipe va l&apos;examiner.
                </p>
                <button
                  onClick={() => setSignalerOuvert(false)}
                  className="bg-signature mt-4 w-full rounded-full px-5 py-3 font-semibold text-white"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display text-xl font-semibold">
                    Signaler {autrePrenom}
                  </p>
                  <button
                    onClick={() => setSignalerOuvert(false)}
                    aria-label="Fermer"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-panel-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mb-3 text-sm text-ink/60">
                  Quel est le problème ?
                </p>
                <div className="flex flex-col gap-2">
                  {RAISONS_SIGNALEMENT.map((r) => (
                    <button
                      key={r}
                      onClick={() => envoyerSignalement(r)}
                      className="rounded-xl bg-panel-2 px-4 py-3 text-left text-sm font-medium text-ink hover:bg-panel"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------- Checklist des documents ---------- */}
      <div className="mb-2 w-full max-w-sm">
        <button
          onClick={() => setChecklistOuverte((v) => !v)}
          className="flex w-full items-center gap-2 rounded-2xl bg-panel px-4 py-2.5 text-sm font-medium text-ink/80"
        >
          <ListChecks className="h-4 w-4 text-violet" />
          Documents
          {docsRequis.length > 0 && (
            <span className="text-ink/50">
              {docsRequis.filter((t) => fournis.has(t)).length}/{docsRequis.length}
            </span>
          )}
          <ChevronDown
            className={
              "ml-auto h-4 w-4 transition-transform " +
              (checklistOuverte ? "rotate-180" : "")
            }
          />
        </button>

        {checklistOuverte && (
          <div className="mt-1 rounded-2xl bg-panel p-3">
            {estLocataire ? (
              <>
                <p className="mb-2 px-1 text-xs text-ink/50">
                  Coche les documents que tu demandes au colocataire :
                </p>
                <div className="flex flex-col gap-1">
                  {TYPES_DOCUMENTS.map((type) => {
                    const demande = docsRequis.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => basculerDoc(type)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-panel-2"
                      >
                        {demande ? (
                          <CheckSquare className="h-5 w-5 shrink-0 text-pink" />
                        ) : (
                          <Square className="h-5 w-5 shrink-0 text-ink/30" />
                        )}
                        <span className={demande ? "text-ink" : "text-ink/60"}>
                          {type}
                        </span>
                        {fournis.has(type) && (
                          <span className="ml-auto text-xs font-medium text-pink">
                            reçu
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : docsRequis.length === 0 ? (
              <p className="px-1 py-2 text-sm text-ink/60">
                L&apos;annonceur n&apos;a pas (encore) demandé de documents.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {docsRequis.map((type) => {
                  const ok = fournis.has(type);
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm"
                    >
                      {ok ? (
                        <CheckSquare className="h-5 w-5 shrink-0 text-pink" />
                      ) : (
                        <Square className="h-5 w-5 shrink-0 text-ink/30" />
                      )}
                      <span className="text-ink">{type}</span>
                      {ok ? (
                        <span className="ml-auto text-xs font-medium text-pink">
                          fourni
                        </span>
                      ) : (
                        <label className="bg-signature ml-auto cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-white">
                          Envoyer
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => envoyerDocType(e, type)}
                            disabled={envoiDoc}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fil des messages */}
      <div className="flex w-full max-w-sm flex-1 flex-col gap-2 overflow-y-auto rounded-2xl bg-panel p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-ink/50">
            C&apos;est le début de votre conversation. Dis bonjour !
          </p>
        ) : (
          messages.map((m) => {
            const deMoi = m.sender_id === user?.id;
            // Message = vocal
            if (m.doc_path && estVocal(m)) {
              const url = docUrls[m.doc_path];
              return (
                <div
                  key={m.id}
                  className={
                    "max-w-[80%] rounded-2xl bg-panel-2 p-1.5 " +
                    (deMoi ? "self-end" : "self-start")
                  }
                >
                  {url ? (
                    <audio controls src={url} className="h-9 w-56 max-w-full" />
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-1 text-sm text-ink/60">
                      <Mic className="h-4 w-4" /> Message vocal…
                    </span>
                  )}
                </div>
              );
            }
            // Message = document joint
            if (m.doc_path) {
              return (
                <button
                  key={m.id}
                  onClick={() => ouvrirDoc(m.doc_path!)}
                  className={
                    "flex max-w-[80%] items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm " +
                    (deMoi
                      ? "bg-signature self-end text-white"
                      : "self-start bg-panel-2 text-ink")
                  }
                >
                  <FileText className="h-5 w-5 shrink-0" />
                  <span className="truncate">{m.doc_name}</span>
                  <Download className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              );
            }
            // Message = proposition de visite
            if (m.doc_name === MARQUEUR_VISITE) {
              const [iso, lieu] = m.content.split("|");
              const d = new Date(iso);
              const quand = d.toLocaleString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={m.id}
                  className={
                    "max-w-[85%] rounded-2xl bg-panel-2 p-3 " +
                    (deMoi ? "self-end" : "self-start")
                  }
                >
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <CalendarClock className="h-4 w-4 text-pink" /> Visite proposée
                  </p>
                  <p className="mt-1 text-sm capitalize text-ink/85">{quand}</p>
                  {lieu && <p className="text-sm text-ink/60">{lieu}</p>}
                  <a
                    href={lienAgenda(iso, lieu)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block rounded-full bg-pink/10 px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/20"
                  >
                    Ajouter à mon agenda
                  </a>
                  {/* Le colocataire peut accepter le créneau */}
                  {!estLocataire && !visiteAcceptee && (
                    <button
                      onClick={() => onAccepterVisite(iso, lieu)}
                      className="bg-signature mt-2 ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Check className="h-3.5 w-3.5" /> Accepter le rendez-vous
                    </button>
                  )}
                </div>
              );
            }
            // Message = visite acceptée
            if (m.doc_name === MARQUEUR_VISITE_OK) {
              const [iso] = m.content.split("|");
              const quand = new Date(iso).toLocaleString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={m.id}
                  className={
                    "flex max-w-[85%] items-center gap-1.5 rounded-2xl bg-panel-2 px-3 py-2 text-sm font-semibold text-pink " +
                    (deMoi ? "self-end" : "self-start")
                  }
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                  <span className="capitalize">Rendez-vous confirmé · {quand}</span>
                </div>
              );
            }
            // Message texte
            return (
              <div
                key={m.id}
                className={
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                  (deMoi
                    ? "bg-signature self-end text-white"
                    : "self-start bg-panel-2 text-ink")
                }
              >
                {m.content}
              </div>
            );
          })
        )}
        {/* Accusé de lecture : "Vu" sous mon dernier message s'il a été lu */}
        {(() => {
          const last = messages[messages.length - 1];
          if (
            last &&
            last.sender_id === user?.id &&
            last.id === monDernierMsgId &&
            autreLuAt &&
            autreLuAt >= last.created_at
          ) {
            return (
              <p className="self-end pr-1 text-xs text-ink/40">Vu</p>
            );
          }
          return null;
        })()}
        <div ref={finRef} />
      </div>

      {/* Suggestions d'accroche / questions (selon le rôle) */}
      {!recording && (
        <div className="mt-2 flex w-full max-w-sm gap-2 overflow-x-auto pb-1">
          {(estLocataire
            ? [
                "Quand voudrais-tu emménager ?",
                "As-tu un garant ?",
                "Tu cherches pour combien de temps ?",
                "Quelle est ta situation pro ?",
                "Tu fumes ? as-tu des animaux ?",
              ]
            : [
                "Bonjour ! Ton annonce m'intéresse 😊",
                "La chambre est-elle toujours dispo ?",
                "Quand peut-on faire une visite ?",
                "Les charges sont-elles comprises ?",
                "Quel est le montant de la caution ?",
              ]
          ).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTexte(s)}
              className="shrink-0 rounded-full border border-ink/15 bg-panel px-3 py-1.5 text-xs text-ink/75 hover:border-pink hover:text-pink"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Zone d'envoi */}
      {recording ? (
        <div className="mt-3 flex w-full max-w-sm items-center gap-2 rounded-full bg-panel px-3 py-2">
          <span className="ml-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-pink" />
          <span className="flex-1 text-sm text-ink/70">
            Enregistrement… {Math.floor(recordSec / 60)}:
            {String(recordSec % 60).padStart(2, "0")}
          </span>
          <button
            onClick={annulerVocal}
            aria-label="Annuler"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink/60 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={envoyerVocal}
            aria-label="Envoyer le vocal"
            className="bg-signature flex h-11 w-11 items-center justify-center rounded-full text-white"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <form onSubmit={envoyer} className="mt-3 flex w-full max-w-sm items-center gap-2">
          {/* Joindre un document (fiche de paie, garant…) */}
          <label
            title="Joindre un document"
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/10 bg-panel text-ink/60 transition-colors hover:text-pink"
          >
            <Paperclip className={"h-5 w-5 " + (envoiDoc ? "animate-pulse text-pink" : "")} />
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={joindreDoc}
              disabled={envoiDoc}
              className="hidden"
            />
          </label>
          {/* Planifier une visite — réservé à l'annonceur */}
          {estLocataire && (
            <button
              type="button"
              onClick={() => setVisiteOuverte(true)}
              title="Proposer une visite"
              aria-label="Proposer une visite"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-panel text-ink/60 transition-colors hover:text-pink"
            >
              <CalendarPlus className="h-5 w-5" />
            </button>
          )}
          <input
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Écris un message…"
            className="flex-1 rounded-full border border-ink/10 bg-panel px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
          />
          {texte.trim() ? (
            <button
              type="submit"
              aria-label="Envoyer"
              className="bg-signature flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={demarrerVocal}
              aria-label="Message vocal"
              title="Message vocal"
              className="bg-signature flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </form>
      )}
    </main>
  );
}
