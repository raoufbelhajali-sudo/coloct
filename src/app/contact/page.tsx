import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Contact — FlatSwiper",
  description: "Contacte l'équipe FlatSwiper : une question, un partenariat, un souci ? Écris-nous.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-5 py-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>

        <h1 className="font-display text-3xl font-bold md:text-4xl">Contact</h1>
        <p className="mt-3 text-ink/70">
          Une question, un partenariat (résidences, agences), un souci sur ton
          compte ou une annonce ? On te répond rapidement.
        </p>

        <div className="mt-8 rounded-3xl bg-panel p-6">
          <p className="text-sm text-ink/60">Écris-nous à</p>
          <a
            href="mailto:contact@flatswiper.com"
            className="bg-signature mt-3 inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white"
          >
            <Mail className="h-5 w-5" /> contact@flatswiper.com
          </a>
        </div>

        <div className="mt-8 space-y-2 text-sm text-ink/60">
          <p>
            <strong className="text-ink/80">Annonceurs &amp; agences</strong> :
            tu peux publier tes chambres gratuitement depuis{" "}
            <Link href="/connexion" className="text-pink underline">
              l&apos;espace annonceur
            </Link>
            .
          </p>
          <p>
            <strong className="text-ink/80">Colocataires</strong> : le swipe et la
            messagerie se font sur l&apos;application FlatSwiper.
          </p>
        </div>

        <nav className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink/10 pt-6 text-sm text-ink/60">
          <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-ink">Confidentialité</Link>
          <Link href="/cgu" className="hover:text-ink">CGU</Link>
        </nav>
      </main>
    </div>
  );
}
