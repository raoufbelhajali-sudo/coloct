"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import {
  Heart,
  Sparkles,
  MessageSquare,
  Gift,
  ShieldCheck,
  Images,
  MousePointerClick,
  Search,
  Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [estNatif, setEstNatif] = useState(false);

  useEffect(() => {
    setEstNatif(Capacitor.isNativePlatform());
  }, []);

  // Dans l'app : pas de page "site" → on va direct au produit / à la connexion
  useEffect(() => {
    if (!estNatif || loading) return;
    if (user && profile) {
      router.replace(profile.role === "locataire" ? "/locataire" : "/swipe");
    } else {
      router.replace("/connexion");
    }
  }, [estNatif, loading, user, profile, router]);

  // Sur le web : déjà connecté → on entre dans son espace
  useEffect(() => {
    if (estNatif || loading || !user || !profile) return;
    router.replace(profile.role === "locataire" ? "/locataire" : "/swipe");
  }, [estNatif, loading, user, profile, router]);

  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      {/* ===== En-tête ===== */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="h-7 w-auto" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
            <a href="#comment" className="hover:text-ink">
              Comment ça marche
            </a>
            <a href="#pourquoi" className="hover:text-ink">
              Pourquoi FlatSwiper
            </a>
            <a href="#faq" className="hover:text-ink">
              FAQ
            </a>
          </nav>
          <Link
            href="/connexion"
            className="bg-signature rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12]"
          style={{ backgroundImage: "url(/accueil-bg.jpg)" }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-pink">
              <Sparkles className="h-4 w-4" /> 100% gratuit
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Trouve ta colocation
              <br />
              <span className="text-signature">en swipant</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink/70 md:mx-0">
              Swipe les chambres (ou les colocataires) près de chez toi. Un match,
              et la conversation commence. Partout en France.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link
                href="/connexion"
                className="bg-signature glow-pink inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.03] sm:w-auto"
              >
                <Search className="h-5 w-5" /> Je cherche une chambre
              </Link>
              <Link
                href="/connexion"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-bg px-7 py-4 text-base font-semibold text-ink transition-colors hover:border-ink/30 sm:w-auto"
              >
                <HomeIcon className="h-5 w-5 text-bleu" /> Je propose ma chambre
              </Link>
            </div>
          </div>

          {/* Visuel logo */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-symbol.png"
              alt=""
              aria-hidden
              className="w-48 max-w-[60%] drop-shadow-[0_20px_50px_rgba(250,82,82,0.25)] md:w-72"
            />
          </div>
        </div>
      </section>

      {/* ===== Comment ça marche ===== */}
      <section id="comment" className="bg-panel/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            Comment ça marche ?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: Sparkles,
                t: "1. Swipe",
                d: "Parcours les annonces (ou les profils) et like ce qui te plaît, passe le reste.",
              },
              {
                Icon: Heart,
                t: "2. Matche",
                d: "Quand l'intérêt est réciproque, c'est un match — comme une vraie rencontre.",
              },
              {
                Icon: MessageSquare,
                t: "3. Discute",
                d: "Échangez en direct, partagez vos documents et organisez la visite.",
              },
            ].map(({ Icon, t, d }) => (
              <div
                key={t}
                className="rounded-3xl bg-bg p-7 text-center shadow-sm ring-1 ring-ink/5"
              >
                <div className="bg-signature mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pourquoi FlatSwiper ===== */}
      <section id="pourquoi">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            Pourquoi FlatSwiper&nbsp;?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Gift, t: "100% gratuit", d: "Crée ton compte et matche sans rien payer." },
              { Icon: MousePointerClick, t: "Tu choisis", d: "Tu ne discutes qu'avec les profils qui te plaisent." },
              { Icon: Images, t: "Profils + photos", d: "Tu vois la personne et le logement avant de te lancer." },
              { Icon: ShieldCheck, t: "Plus de confiance", d: "Vérification d'identité et messagerie sécurisée." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-3xl bg-panel/60 p-6">
                <Icon className="h-8 w-8 text-pink" />
                <h3 className="mt-4 font-display text-lg font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Bandeau CTA ===== */}
      <section className="px-5">
        <div className="bg-signature glow-pink mx-auto w-full max-w-6xl rounded-3xl px-8 py-12 text-center text-white md:py-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Prêt·e à trouver ta coloc&nbsp;?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/90">
            Rejoins FlatSwiper gratuitement et commence à swiper dès maintenant.
          </p>
          <Link
            href="/connexion"
            className="mt-7 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-pink transition-transform hover:scale-[1.03]"
          >
            Commencer
          </Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 md:py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            Questions fréquentes
          </h2>
          <div className="mt-10 space-y-3">
            {[
              {
                q: "FlatSwiper, c'est vraiment gratuit ?",
                r: "Oui. La création de compte, le swipe, les matchs et la messagerie sont gratuits.",
              },
              {
                q: "Comment fonctionne le match ?",
                r: "Tu likes une annonce (ou un profil). Si l'autre te like aussi, c'est un match et vous pouvez discuter.",
              },
              {
                q: "Je propose une chambre, comment ça marche ?",
                r: "Tu publies ton annonce (photos, loyer, ville…) et tu swipes les colocataires intéressés. Tu peux publier plusieurs chambres.",
              },
              {
                q: "FlatSwiper est disponible partout en France ?",
                r: "Oui, tu choisis ta ville et ton département parmi toutes les communes de France.",
              },
            ].map(({ q, r }) => (
              <details
                key={q}
                className="group rounded-2xl bg-panel/60 p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between font-medium text-ink marker:content-['']">
                  {q}
                  <span className="text-pink transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink/70">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pied de page ===== */}
      <footer className="border-t border-ink/10 bg-panel/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="FlatSwiper" className="mx-auto h-7 w-auto md:mx-0" />
            <p className="mt-2 text-sm text-ink/50">
              Trouve ta colocation partout en France, en swipant.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink/60">
            <Link href="/connexion" className="hover:text-ink">
              Se connecter
            </Link>
            <Link href="/mentions-legales" className="hover:text-ink">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-ink">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-ink">
              CGU
            </Link>
          </nav>
        </div>
        <p className="pb-6 text-center text-xs text-ink/35">
          © {new Date().getFullYear()} FlatSwiper · flatswiper.com
        </p>
      </footer>
    </div>
  );
}
