"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getMessages,
  sendMessage,
  getMyMatches,
  type Message,
} from "@/lib/messages";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = Number(params.id);
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [titre, setTitre] = useState("Conversation");
  const finRef = useRef<HTMLDivElement>(null);

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
      },
    ]);
    await sendMessage(matchId, user.id, contenu);
  }

  return (
    <main className="flex h-screen flex-col items-center px-4 py-4">
      {/* En-tête */}
      <header className="flex w-full max-w-sm items-center gap-3 pb-3">
        <Link href="/matchs" className="text-ink/60 hover:text-ink">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{titre}</p>
        </div>
      </header>

      {/* Fil des messages */}
      <div className="flex w-full max-w-sm flex-1 flex-col gap-2 overflow-y-auto rounded-2xl bg-panel p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-ink/50">
            C&apos;est le début de votre conversation. Dis bonjour 👋
          </p>
        ) : (
          messages.map((m) => {
            const deMoi = m.sender_id === user?.id;
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
      <form onSubmit={envoyer} className="mt-3 flex w-full max-w-sm gap-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris un message…"
          className="flex-1 rounded-full border border-ink/10 bg-panel px-4 py-3 text-ink placeholder:text-ink/30 focus:border-pink focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="bg-signature flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </main>
  );
}
