import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "Mentions légales — FlatSwiper" };

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      <Link href="/" className="mb-6 flex items-center gap-2 text-ink/60 hover:text-ink">
        <ArrowLeft className="h-5 w-5" /> <LogoMark className="h-6 w-6" /> Accueil
      </Link>

      <h1 className="font-display text-3xl font-semibold">Mentions légales</h1>
      <p className="mt-1 text-sm text-ink/50">Dernière mise à jour : juin 2026</p>

      <div className="mt-6 space-y-6 text-ink/85">
        <section>
          <h2 className="font-display text-xl font-semibold">Éditeur du site</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Le site et l&apos;application <strong>FlatSwiper</strong> (accessible à
            l&apos;adresse flatswiper.com) sont édités par&nbsp;:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
            <li>Statut : entrepreneur individuel (auto-entrepreneur)</li>
            <li>Email de contact : contact@flatswiper.com</li>
            <li>
              Les informations détaillées de l&apos;éditeur (nom, adresse, SIRET)
              sont disponibles sur simple demande à contact@flatswiper.com.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Hébergement</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave
            #4133, Walnut, CA 91789, États-Unis — vercel.com. La base de données et
            l&apos;authentification sont fournies par <strong>Supabase</strong>
            (Supabase, Inc.). Le nom de domaine est géré par <strong>IONOS</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Propriété intellectuelle</h2>
          <p className="mt-2 text-sm leading-relaxed">
            L&apos;ensemble des éléments du site (marque FlatSwiper, logo, textes,
            interface) est protégé. Toute reproduction sans autorisation est
            interdite. Les photos publiées par les utilisateurs restent leur
            propriété.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Responsabilité</h2>
          <p className="mt-2 text-sm leading-relaxed">
            FlatSwiper met en relation des personnes cherchant ou proposant une
            colocation. L&apos;éditeur n&apos;est pas partie aux échanges, visites
            ou contrats conclus entre utilisateurs et ne saurait être tenu
            responsable du contenu des annonces ni du comportement des membres.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Pour toute question : contact@flatswiper.com.
          </p>
        </section>

        <p className="pt-4 text-xs text-ink/40">
          Voir aussi notre{" "}
          <Link href="/confidentialite" className="text-pink underline">
            politique de confidentialité
          </Link>{" "}
          et nos{" "}
          <Link href="/cgu" className="text-pink underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
