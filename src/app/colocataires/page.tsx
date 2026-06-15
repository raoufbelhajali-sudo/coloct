"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Wallet, Briefcase, Heart, X, Smartphone, Play, ShieldCheck,
} from "lucide-react";
import { getColocatairesPublics } from "@/lib/colocataires";
import type { Profile } from "@/lib/auth";

function CarteColocataire({ p, onContact }: { p: Profile; onContact: () => void }) {
  return (
    <button
      onClick={onContact}
      className="group flex flex-col overflow-hidden rounded-2xl bg-panel text-left ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
        {p.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo_url}
            alt={p.prenom}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="bg-signature flex h-full w-full items-center justify-center text-4xl font-bold text-white">
            {p.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
        {p.identite_verifiee && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-bg/90 px-2 py-1 text-[11px] font-semibold text-violet shadow">
            <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
          </span>
        )}
        {p.budget_max ? (
          <span className="bg-signature absolute bottom-2 left-2 rounded-full px-3 py-1 text-sm font-bold text-white shadow">
            ≤ {p.budget_max} €
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-display text-lg font-semibold leading-tight">
          {p.prenom}
          {p.age ? <span className="font-normal text-ink/60">, {p.age} ans</span> : null}
        </p>
        <div className="mt-1 space-y-0.5 text-sm text-ink/60">
          {p.ville && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-bleu" /> {p.ville}
            </p>
          )}
          {p.profession && (
            <p className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-bleu" /> {p.profession}
            </p>
          )}
        </div>
        {p.interets && p.interets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.interets.slice(0, 3).map((i) => (
              <span key={i} className="rounded-full bg-panel-2 px-2.5 py-0.5 text-xs text-ink/70">
                {i}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export default function ColocatairesPage() {
  const [profils, setProfils] = useState<Profile[]>([]);
  const [chargement, setChargement] = useState(true);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    getColocatairesPublics()
      .then(setProfils)
      .catch(() => setProfils([]))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-ink/70">
            <Link href="/annonces" className="hover:text-ink">Annonces</Link>
            <Link href="/colocataires" className="text-pink">Colocataires</Link>
            <Link href="/connexion" className="bg-signature rounded-full px-4 py-2 text-white">Publier</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>

        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Colocataires en recherche
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-ink/65">
            Découvre les personnes qui cherchent une colocation. Tu as une chambre&nbsp;?
            Repère ceux qui te correspondent et contacte-les depuis l&apos;app.
          </p>
        </div>

        {chargement ? (
          <p className="mt-12 text-center text-ink/50">Chargement des profils…</p>
        ) : profils.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="font-display text-2xl">Bientôt des profils ici&nbsp;!</p>
            <p className="mx-auto mt-2 max-w-sm text-ink/60">
              Les premiers colocataires arrivent. Tu cherches une coloc&nbsp;? Crée ton
              profil sur l&apos;app pour apparaître ici.
            </p>
            <Link href="/connexion" className="bg-signature mt-5 inline-block rounded-full px-7 py-3.5 font-semibold text-white">
              Créer mon profil
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {profils.map((p) => (
              <CarteColocataire key={p.id} p={p} onContact={() => setPopup(true)} />
            ))}
          </div>
        )}
      </main>

      {/* Pop-up "contacter via l'app" */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm" onClick={() => setPopup(false)}>
          <div className="relative w-full max-w-sm rounded-3xl bg-bg p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPopup(false)} aria-label="Fermer" className="absolute right-4 top-4 text-ink/40 hover:text-ink">
              <X className="h-5 w-5" />
            </button>
            <div className="bg-signature glow-pink mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <Heart className="h-8 w-8 text-white" fill="currentColor" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Contacte ce colocataire</h2>
            <p className="mt-2 text-ink/75">
              Pour proposer ta coloc à ce colocataire et discuter, télécharge l&apos;app
              FlatSwiper. Tout se passe en un swipe.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <a href="#" className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white">
                <Smartphone className="h-5 w-5" /> Télécharger sur iPhone
              </a>
              <a href="#" className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink">
                <Play className="h-5 w-5" /> Bientôt sur Android
              </a>
              <Link href="/connexion" className="mt-1 text-sm font-semibold text-pink hover:underline">
                ou continuer sur l&apos;app web →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
