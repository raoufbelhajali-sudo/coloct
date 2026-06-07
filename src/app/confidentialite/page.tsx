import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "Politique de confidentialité — FlatSwiper" };

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      <Link href="/" className="mb-6 flex items-center gap-2 text-ink/60 hover:text-ink">
        <ArrowLeft className="h-5 w-5" /> <LogoMark className="h-6 w-6" /> Accueil
      </Link>

      <h1 className="font-display text-3xl font-semibold">
        Politique de confidentialité
      </h1>
      <p className="mt-1 text-sm text-ink/50">Dernière mise à jour : juin 2026</p>

      <div className="mt-6 space-y-6 text-ink/85">
        <p className="text-sm leading-relaxed">
          FlatSwiper attache de l&apos;importance à la protection de tes données
          personnelles, conformément au Règlement Général sur la Protection des
          Données (RGPD). Le responsable du traitement peut être contacté à
          contact@flatswiper.com.
        </p>

        <section>
          <h2 className="font-display text-xl font-semibold">Données collectées</h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
            <li>Identité : prénom, pseudo, âge, genre, photo de profil.</li>
            <li>Profil : profession, tranche de revenu, centres d&apos;intérêt,
              mode de vie, présentation, ville/département recherchés.</li>
            <li>Compte : email et/ou numéro de téléphone, mot de passe (chiffré).</li>
            <li>Annonces : description du logement, loyer, photos, localisation.</li>
            <li>Échanges : messages, documents et messages vocaux entre membres.</li>
            <li>Pièce d&apos;identité (facultatif, pour la vérification).</li>
            <li>Données techniques : date de connexion, swipes, matchs.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Finalités</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tes données servent à : créer ton compte, te proposer des colocations
            ou colocataires compatibles, permettre les échanges après un match,
            assurer la sécurité (signalements, blocages) et, le cas échéant,
            gérer les options payantes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Base légale</h2>
          <p className="mt-2 text-sm leading-relaxed">
            L&apos;exécution du service (contrat) pour les données nécessaires au
            fonctionnement, et ton consentement pour les données facultatives
            (photo, pièce d&apos;identité…).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Hébergement & sous-traitants</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Les données sont stockées via <strong>Supabase</strong> et le site est
            hébergé par <strong>Vercel</strong>. Les documents et pièces
            d&apos;identité sont conservés dans un espace privé à accès restreint.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Durée de conservation</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tes données sont conservées tant que ton compte est actif. Tu peux
            supprimer ton compte à tout moment (Paramètres → Supprimer mon
            profil) : profil, annonce, matchs et messages sont alors effacés.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Tes droits</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Tu disposes d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de portabilité et d&apos;opposition. Pour les
            exercer : contact@flatswiper.com. Tu peux aussi saisir la CNIL
            (cnil.fr).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Cookies</h2>
          <p className="mt-2 text-sm leading-relaxed">
            FlatSwiper utilise uniquement les cookies/stockage nécessaires au
            fonctionnement (session de connexion, préférences). Aucune publicité
            ni traçage tiers à ce jour.
          </p>
        </section>

        <p className="pt-4 text-xs text-ink/40">
          Voir aussi nos{" "}
          <Link href="/mentions-legales" className="text-pink underline">
            mentions légales
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
