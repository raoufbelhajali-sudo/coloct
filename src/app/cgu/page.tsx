import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Conditions d'utilisation — FlatSwiper" };

export default function CGUPage() {
  return (
    <div className="min-h-screen w-full bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col px-5 py-8">
      <h1 className="font-display text-3xl font-semibold">
        Conditions d&apos;utilisation
      </h1>
      <p className="mt-1 text-sm text-ink/50">Dernière mise à jour : juin 2026</p>

      <div className="mt-6 space-y-6 text-ink/85">
        <section>
          <h2 className="font-display text-xl font-semibold">1. Objet</h2>
          <p className="mt-2 text-sm leading-relaxed">
            FlatSwiper est un service de mise en relation entre personnes
            cherchant une colocation et personnes proposant une chambre/logement
            en colocation. L&apos;utilisation du service implique l&apos;acceptation
            des présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">2. Accès & compte</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tu dois être majeur (18 ans) et fournir des informations exactes. Tu
            es responsable de la confidentialité de ton compte.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">3. Règles de conduite</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Sont interdits : les faux profils, l&apos;usurpation d&apos;identité,
            les annonces trompeuses, les propos haineux ou harcelants, les
            demandes d&apos;argent frauduleuses et tout contenu illégal. Tout
            manquement peut entraîner la suspension du compte.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">4. Contenus des utilisateurs</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tu restes propriétaire de tes contenus (photos, textes). Tu garantis
            disposer des droits nécessaires pour les publier et autorises
            FlatSwiper à les afficher dans le cadre du service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">5. Options payantes</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Certaines fonctionnalités (Pass, boosts) peuvent être payantes. Les
            conditions et tarifs sont indiqués au moment de l&apos;achat.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">6. Responsabilité</h2>
          <p className="mt-2 text-sm leading-relaxed">
            FlatSwiper fournit un outil de mise en relation mais n&apos;est pas
            partie aux visites, accords ou contrats de colocation. Vérifie
            toujours l&apos;identité de ton interlocuteur et la réalité du
            logement avant tout engagement ou versement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">7. Résiliation</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tu peux supprimer ton compte à tout moment depuis les Paramètres.
          </p>
        </section>

        <p className="pt-4 text-xs text-ink/40">
          Voir aussi nos{" "}
          <Link href="/mentions-legales" className="text-pink underline">
            mentions légales
          </Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="text-pink underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
      </main>
    </div>
  );
}
