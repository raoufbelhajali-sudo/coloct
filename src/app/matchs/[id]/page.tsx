"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Paperclip, FileText, Download, Mic, X,
  ListChecks, CheckSquare, Square, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getMessages,
  sendMessage,
  sendDocument,
  sendVoice,
  getDocUrl,
  getMyMatches,
  getMatchInfo,
  setDocumentsRequis,
  TYPES_DOCUMENTS,
  type Message,
} from "@/lib/messages";
import { marquerMatchLu } from "@/lib/notifications";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = Number(params.id);
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [titre, setTitre] = useState("Conversation");
  const [envoiDoc, setEnvoiDoc] = useState(false);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({}); // liens des vocaux
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [estLocataire, setEstLocataire] = useState(false);
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
      if (m) setTitre(`${m.titre} — avec ${m.autrePrenom}`);
    });
  }, [user, matchId]);

  // Consulter la conversation acquitte ses messages (compteur de notifs)
  useEffect(() => {
    if (user) marquerMatchLu(matchId);
  }, [user, matchId, messages]);

  // Rôle + documents demandés (checklist)
  useEffect(() => {
    if (!user) return;
    getMatchInfo(matchId).then((info) => {
      if (!info) return;
      setEstLocataire(info.locataire_id === user.id);
      setDocsRequis(info.documents_requis);
    });
  }, [user, matchId]);

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
    const charger = () =>
      getMessages(matchId).then((m) => {
        if (actif) setMessages(m);
      });
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
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{titre}</p>
        </div>
      </header>

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
                Le locataire n&apos;a pas (encore) demandé de documents.
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
        <div ref={finRef} />
      </div>

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
