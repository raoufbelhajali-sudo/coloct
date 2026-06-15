"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, ShieldCheck, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getColocatairesPublics } from "@/lib/colocataires";
import type { Profile } from "@/lib/auth";

function CarteColocataire({ p }: { p: Profile }) {
  return (
    <Link
      href={`/colocataire/?id=${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-panel ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
        {p.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo_url}
            alt={p.prenom}
            className="h-full w-full scale-110 object-cover blur-lg"
          />
        ) : (
          <span className="bg-signature flex h-full w-full items-center justify-center text-4xl font-bold text-white">
            {p.prenom?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
        {/* Cadenas : photo protégée tant qu'on n'a pas swipé */}
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-bg/75 text-ink/70 backdrop-blur">
          <Lock className="h-3.5 w-3.5" />
        </span>
        {p.budget_max ? (
          <span className="bg-signature absolute bottom-2 left-2 rounded-full px-3 py-1 text-sm font-bold text-white shadow">
            ≤ {p.budget_max} €
          </span>
        ) : null}
        {p.identite_verifiee && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-bg/90 px-2 py-1 text-[11px] font-semibold text-violet shadow">
            <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
          </span>
        )}
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
    </Link>
  );
}

export default function ColocatairesPage() {
  const [profils, setProfils] = useState<Profile[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getColocatairesPublics()
      .then(setProfils)
      .catch(() => setProfils([]))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>

        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Colocataires en recherche
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-ink/65">
            Découvre les personnes qui cherchent une colocation. Les photos se révèlent
            quand tu swipes&nbsp;: ouvre l&apos;app pour matcher et discuter.
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
              <CarteColocataire key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
