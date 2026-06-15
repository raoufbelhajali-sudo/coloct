"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { MessageCircle, Plus, X, Tag, ArrowLeft, Monitor } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSujets, creerSujet, CATEGORIES_FORUM, type Sujet } from "@/lib/forum";

// Le blog se consulte uniquement sur ORDINATEUR (pas mobile web, pas l'app).
export function useAccesOrdinateur(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    setOk(!Capacitor.isNativePlatform() && window.innerWidth >= 1024);
  }, []);
  return ok;
}

export function BlogSurOrdinateur() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Monitor className="h-12 w-12 text-violet" />
      <h1 className="font-display text-2xl font-bold">Le blog est sur ordinateur</h1>
      <p className="max-w-xs text-sm text-ink/70">
        Le Blog &amp; Entraide FlatSwiper se consulte depuis un ordinateur
        (PC/Mac). Sur mobile, retrouve les colocations directement dans l&apos;app.
      </p>
      <Link href="/" className="bg-signature rounded-full px-6 py-3 font-semibold text-white">
        Retour
      </Link>
    </main>
  );
}

export default function BlogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const accesPC = useAccesOrdinateur();
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [formOuvert, setFormOuvert] = useState(false);

  // Formulaire nouveau sujet
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIES_FORUM[0]);
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setSujets(await getSujets());
    setChargement(false);
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  function ouvrirForm() {
    if (!user) {
      router.push("/connexion");
      return;
    }
    setFormOuvert(true);
  }

  async function publier(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (titre.trim().length < 5) return setErreur("Donne un titre un peu plus précis.");
    if (contenu.trim().length < 10) return setErreur("Développe un peu ta question.");
    if (!user) return;
    setEnvoi(true);
    const id = await creerSujet(user.id, titre.trim(), contenu.trim(), categorie);
    setEnvoi(false);
    if (!id) {
      setErreur("Impossible de publier. Réessaie.");
      return;
    }
    setFormOuvert(false);
    setTitre("");
    setContenu("");
    router.push(`/blog/sujet/?id=${id}`);
  }

  if (accesPC === null) return null;
  if (!accesPC) return <BlogSurOrdinateur />;

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-ink/70">
            <Link href="/annonces" className="hover:text-ink">Annonces</Link>
            <Link href="/colocataires" className="hover:text-ink">Colocataires</Link>
            <Link href="/blog" className="text-pink">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold md:text-4xl">
              <MessageCircle className="h-8 w-8 text-bleu" /> Blog & Entraide
            </h1>
            <p className="mt-2 max-w-xl text-ink/65">
              Questions, conseils et discussions sur la colocation. Pose tes questions,
              partage ton expérience — la communauté FlatSwiper te répond.
            </p>
          </div>
          <button
            onClick={ouvrirForm}
            className="bg-signature glow-pink flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white"
          >
            <Plus className="h-5 w-5" /> Poser une question
          </button>
        </div>

        {!user && (
          <p className="mt-4 rounded-2xl bg-panel px-4 py-3 text-sm text-ink/70">
            💬 Pour <strong>poser une question</strong> ou <strong>répondre</strong>,
            connecte-toi à l&apos;app (annonceur, colocataire ou agence).{" "}
            <Link href="/connexion" className="font-semibold text-pink hover:underline">Se connecter →</Link>
          </p>
        )}

        {/* Liste des sujets */}
        {chargement ? (
          <p className="mt-12 text-center text-ink/50">Chargement…</p>
        ) : sujets.length === 0 ? (
          <p className="mt-12 text-center text-ink/50">Aucune discussion pour l&apos;instant. Lance la première&nbsp;!</p>
        ) : (
          <div className="mt-7 space-y-3">
            {sujets.map((s) => (
              <Link
                key={s.id}
                href={`/blog/sujet/?id=${s.id}`}
                className="block rounded-2xl bg-panel p-5 ring-1 ring-ink/5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-bleu-clair px-2.5 py-1 text-xs font-semibold text-violet">
                    <Tag className="h-3 w-3" /> {s.categorie}
                  </span>
                  <span className="text-xs text-ink/45">par {s.auteur}</span>
                </div>
                <p className="mt-2 font-display text-xl font-semibold leading-tight">{s.titre}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/65">{s.contenu}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink/50">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {s.nbReponses} réponse{s.nbReponses > 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Modale : nouvelle question */}
      {formOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm" onClick={() => setFormOuvert(false)}>
          <form
            onSubmit={publier}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-bg p-6 shadow-2xl"
          >
            <button type="button" onClick={() => setFormOuvert(false)} aria-label="Fermer" className="absolute right-4 top-4 text-ink/40 hover:text-ink">
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display text-2xl font-bold">Poser une question</h2>
            <div className="mt-4 space-y-3">
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-panel px-4 py-3 text-sm focus:border-pink focus:outline-none"
              >
                {CATEGORIES_FORUM.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ta question en une phrase"
                className="w-full rounded-xl border border-ink/10 bg-panel px-4 py-3 text-sm focus:border-pink focus:outline-none"
              />
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Donne des détails…"
                rows={5}
                className="w-full rounded-xl border border-ink/10 bg-panel px-4 py-3 text-sm focus:border-pink focus:outline-none"
              />
              {erreur && <p className="text-sm font-medium text-pink">{erreur}</p>}
              <button
                disabled={envoi}
                className="bg-signature w-full rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                {envoi ? "Publication…" : "Publier ma question"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
