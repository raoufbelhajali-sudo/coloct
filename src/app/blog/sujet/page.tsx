"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Tag, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSujet, getReponses, repondre, type Sujet, type Reponse } from "@/lib/forum";
import { useAccesOrdinateur, BlogSurOrdinateur } from "@/app/blog/page";
import SiteHeader from "@/components/SiteHeader";

function dateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function SujetContenu() {
  const params = useSearchParams();
  const id = params.get("id");
  const { user } = useAuth();
  const [sujet, setSujet] = useState<Sujet | null>(null);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [chargement, setChargement] = useState(true);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    if (!id) {
      setChargement(false);
      return;
    }
    const [s, r] = await Promise.all([getSujet(id), getReponses(id)]);
    setSujet(s);
    setReponses(r);
    setChargement(false);
  }, [id]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !sujet || texte.trim().length < 2) return;
    setEnvoi(true);
    const ok = await repondre(user.id, sujet.id, texte.trim());
    setEnvoi(false);
    if (ok) {
      setTexte("");
      const r = await getReponses(String(sujet.id));
      setReponses(r);
    }
  }

  if (chargement) return <p className="mt-16 text-center text-ink/50">Chargement…</p>;
  if (!sujet) {
    return (
      <div className="mt-16 text-center">
        <p className="text-ink/60">Sujet introuvable.</p>
        <Link href="/blog" className="mt-3 inline-block text-pink underline">Retour au blog</Link>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link href="/blog" className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Blog &amp; Entraide
      </Link>

      {/* Le sujet */}
      <article className="rounded-3xl bg-panel p-6 ring-1 ring-ink/5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-bleu-clair px-2.5 py-1 text-xs font-semibold text-violet">
            <Tag className="h-3 w-3" /> {sujet.categorie}
          </span>
          <span className="text-xs text-ink/45">par {sujet.auteur} · {dateFr(sujet.created_at)}</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">{sujet.titre}</h1>
        <p className="mt-3 whitespace-pre-line text-ink/80">{sujet.contenu}</p>
      </article>

      {/* Réponses */}
      <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold">
        <MessageCircle className="h-5 w-5 text-bleu" />
        {reponses.length} réponse{reponses.length > 1 ? "s" : ""}
      </h2>
      <div className="mt-4 space-y-3">
        {reponses.map((r) => (
          <div key={r.id} className="rounded-2xl bg-panel p-4">
            <p className="text-xs font-semibold text-ink/55">{r.auteur} · {dateFr(r.created_at)}</p>
            <p className="mt-1.5 whitespace-pre-line text-ink/85">{r.contenu}</p>
          </div>
        ))}
        {reponses.length === 0 && (
          <p className="text-ink/55">Aucune réponse pour l&apos;instant. Sois le premier&nbsp;!</p>
        )}
      </div>

      {/* Formulaire de réponse */}
      <div className="mt-8">
        {user ? (
          <form onSubmit={envoyer} className="rounded-2xl bg-panel p-4 ring-1 ring-ink/5">
            <p className="mb-2 font-semibold">Ta réponse</p>
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              rows={4}
              placeholder="Partage ton expérience ou ton conseil…"
              className="w-full rounded-xl border border-ink/10 bg-bg px-4 py-3 text-sm focus:border-pink focus:outline-none"
            />
            <button
              disabled={envoi || texte.trim().length < 2}
              className="bg-signature mt-3 flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {envoi ? "Envoi…" : "Répondre"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl bg-panel px-5 py-4 text-sm text-ink/70">
            💬 Pour <strong>répondre</strong>, connecte-toi (annonceur, colocataire ou agence).{" "}
            <Link href="/connexion" className="font-semibold text-pink hover:underline">Se connecter →</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SujetPage() {
  const accesPC = useAccesOrdinateur();
  if (accesPC === null) return null;
  if (!accesPC) {
    return <div className="min-h-screen w-full bg-bg text-ink"><BlogSurOrdinateur /></div>;
  }
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />
      <Suspense fallback={<p className="mt-16 text-center text-ink/50">Chargement…</p>}>
        <SujetContenu />
      </Suspense>
    </div>
  );
}
