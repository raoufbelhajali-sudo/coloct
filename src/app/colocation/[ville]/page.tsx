import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VilleContenu from "./VilleContenu";

// Villes pré-générées pour le SEO (« Colocation à … »).
const VILLES = [
  { slug: "paris", nom: "Paris" },
  { slug: "lyon", nom: "Lyon" },
  { slug: "marseille", nom: "Marseille" },
  { slug: "toulouse", nom: "Toulouse" },
  { slug: "bordeaux", nom: "Bordeaux" },
  { slug: "lille", nom: "Lille" },
  { slug: "nantes", nom: "Nantes" },
  { slug: "strasbourg", nom: "Strasbourg" },
  { slug: "montpellier", nom: "Montpellier" },
  { slug: "rennes", nom: "Rennes" },
  { slug: "nice", nom: "Nice" },
  { slug: "grenoble", nom: "Grenoble" },
];

// Export statique : on ne génère QUE ces villes (les autres → 404).
export const dynamicParams = false;

export function generateStaticParams() {
  return VILLES.map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const v = VILLES.find((x) => x.slug === ville);
  if (!v) return {};
  const titre = `Colocation à ${v.nom} — FlatSwiper`;
  const desc = `Trouve ta colocation à ${v.nom} en swipant : chambres disponibles, 100% gratuit. Like, matche et discute sur FlatSwiper.`;
  return {
    title: titre,
    description: desc,
    openGraph: { title: titre, description: desc },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const v = VILLES.find((x) => x.slug === ville);
  if (!v) notFound();
  return <VilleContenu ville={v.nom} />;
}
