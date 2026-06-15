"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, MapPin, Wallet, Briefcase, Lock, Heart, ShieldCheck,
  Smartphone, Play,
} from "lucide-react";
import { getColocatairePublic } from "@/lib/colocataires";
import type { Profile } from "@/lib/auth";

function ColocataireContenu() {
  const params = useSearchParams();
  const id = params.get("id");
  const [p, setP] = useState<Profile | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!id) {
      setChargement(false);
      return;
    }
    getColocatairePublic(id)
      .then(setP)
      .catch(() => setP(null))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p className="mt-20 text-center text-ink/50">Chargement…</p>;
  if (!p) {
    return (
      <div className="mt-20 text-center">
        <p className="text-ink/60">Profil introuvable.</p>
        <Link href="/colocataires" className="mt-3 inline-block text-pink underline">
          Voir les colocataires
        </Link>
      </div>
    );
  }

  const tags = [
    ...(p.interets ?? []),
    ...(p.ambiance ?? []),
    ...(p.rythme ?? []),
  ].slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-6">
      <Link href="/colocataires" className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Tous les colocataires
      </Link>

      <div className="grid gap-7 md:grid-cols-5">
        {/* Photo floutée (visage protégé tant qu'on n'a pas swipé) */}
        <div className="md:col-span-2">
          <div className="relative overflow-hidden rounded-3xl bg-panel-2">
            {p.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.photo_url}
                alt={p.prenom}
                className="aspect-[4/5] w-full scale-110 object-cover blur-xl"
              />
            ) : (
              <div className="bg-signature flex aspect-[4/5] w-full items-center justify-center text-6xl font-bold text-white">
                {p.prenom?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            {/* Voile + cadenas */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/15 text-center text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg/25 backdrop-blur">
                <Lock className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold drop-shadow">Photo visible en swipant</p>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="md:col-span-3">
          <h1 className="font-display text-3xl font-bold">
            {p.prenom}
            {p.age ? <span className="font-normal text-ink/60">, {p.age} ans</span> : null}
            {p.identite_verifiee && (
              <span className="ml-2 inline-flex items-center gap-1 align-middle rounded-full bg-bleu-clair px-2 py-1 text-xs font-semibold text-violet">
                <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
              </span>
            )}
          </h1>

          <div className="mt-3 space-y-1.5 text-ink/75">
            {p.ville && (
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-bleu" /> Recherche à {p.ville}</p>
            )}
            {p.budget_max ? (
              <p className="flex items-center gap-2"><Wallet className="h-4 w-4 text-bleu" /> Budget jusqu&apos;à {p.budget_max} € / mois</p>
            ) : null}
            {p.profession && (
              <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-bleu" /> {p.profession}</p>
            )}
          </div>

          {p.bio && <p className="mt-4 whitespace-pre-line text-ink/80">{p.bio}</p>}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-panel px-3 py-1 text-sm text-ink/75">{t}</span>
              ))}
            </div>
          )}

          {/* CTA : swiper dans l'app */}
          <div className="bg-signature glow-pink mt-7 rounded-3xl px-6 py-6 text-center text-white">
            <p className="font-display text-xl font-bold">Ce colocataire te plaît&nbsp;?</p>
            <p className="mx-auto mt-1.5 max-w-sm text-white/90">
              Pour swiper {p.prenom}, matcher et discuter, continue sur l&apos;app FlatSwiper.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/connexion" className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-pink">
                <Heart className="h-5 w-5" fill="currentColor" /> Swiper sur l&apos;app web
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-sm text-white/85">
              <a href="#" className="flex items-center gap-1.5 hover:text-white"><Smartphone className="h-4 w-4" /> iPhone</a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white"><Play className="h-4 w-4" /> Google Play</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ColocatairePage() {
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-5">
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-ink/70">
            <Link href="/annonces" className="hover:text-ink">Annonces</Link>
            <Link href="/colocataires" className="hover:text-ink">Colocataires</Link>
          </nav>
        </div>
      </header>
      <Suspense fallback={<p className="mt-20 text-center text-ink/50">Chargement…</p>}>
        <ColocataireContenu />
      </Suspense>
    </div>
  );
}
