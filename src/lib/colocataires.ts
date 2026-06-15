import { supabase } from "./supabase";
import type { Profile } from "./auth";

// 20 profils "vitrine" : uniquement pour l'apparence sur le SITE (pas de vrais
// comptes, pas d'auth, pas swipables). Photos floutées côté affichage.
type Vit = {
  prenom: string; age: number; ville: string; budget_max: number;
  profession: string; img: number; bio: string;
  interets: string[]; ambiance: string[]; rythme: string[]; verifie?: boolean;
};
const V: Vit[] = [
  { prenom: "Léa", age: 22, ville: "Lyon", budget_max: 550, profession: "Étudiante en droit", img: 5, bio: "Étudiante calme et organisée, je cherche une coloc conviviale près du campus. J'adore cuisiner pour les autres !", interets: ["Cuisine", "Yoga", "Lecture"], ambiance: ["Calme", "Sociable"], rythme: ["Matinale"], verifie: true },
  { prenom: "Hugo", age: 25, ville: "Bordeaux", budget_max: 600, profession: "Développeur web", img: 12, bio: "Jeune actif dans la tech, plutôt cool et facile à vivre. Télétravail 3 jours/semaine.", interets: ["Jeux vidéo", "Running", "Musique"], ambiance: ["Détendu", "Sociable"], rythme: ["Flexible"] },
  { prenom: "Camille", age: 23, ville: "Paris", budget_max: 750, profession: "Designer graphique", img: 9, bio: "Créative et sociable, je cherche une coloc vivante dans l'est parisien.", interets: ["Art", "Expos", "Photo"], ambiance: ["Sociable", "Fêtarde"], rythme: ["Noctambule"], verifie: true },
  { prenom: "Nathan", age: 21, ville: "Toulouse", budget_max: 480, profession: "Étudiant en ingénierie", img: 15, bio: "Étudiant motivé, sportif, propre et respectueux. Open pour les soirées coloc !", interets: ["Foot", "Ciné", "Voyage"], ambiance: ["Sociable"], rythme: ["Flexible"] },
  { prenom: "Manon", age: 24, ville: "Lille", budget_max: 500, profession: "Infirmière", img: 16, bio: "Horaires décalés mais super discrète. Je cherche une coloc bienveillante.", interets: ["Rando", "Séries", "Cuisine"], ambiance: ["Calme"], rythme: ["Flexible"], verifie: true },
  { prenom: "Lucas", age: 27, ville: "Nantes", budget_max: 560, profession: "Chef de projet", img: 33, bio: "Jeune actif posé, j'aime les coloc où on partage des repas sans se marcher dessus.", interets: ["Vélo", "Cuisine", "Concerts"], ambiance: ["Détendu", "Sociable"], rythme: ["Matinal"] },
  { prenom: "Chloé", age: 20, ville: "Montpellier", budget_max: 420, profession: "Étudiante en LEA", img: 20, bio: "Première coloc ! Souriante, ordonnée, j'adore les apéros sur la terrasse.", interets: ["Plage", "Langues", "Danse"], ambiance: ["Sociable", "Fêtarde"], rythme: ["Noctambule"] },
  { prenom: "Théo", age: 26, ville: "Rennes", budget_max: 520, profession: "Graphiste freelance", img: 52, bio: "Indépendant, je bosse de la maison. Calme et créatif, j'aime une coloc tranquille.", interets: ["Dessin", "Café", "BD"], ambiance: ["Calme"], rythme: ["Flexible"] },
  { prenom: "Sarah", age: 23, ville: "Strasbourg", budget_max: 540, profession: "Étudiante en médecine", img: 25, bio: "Studieuse mais sociable, je cherche des colocs sympas pour décompresser entre deux révisions.", interets: ["Sport", "Cuisine", "Voyage"], ambiance: ["Sociable", "Calme"], rythme: ["Matinale"], verifie: true },
  { prenom: "Maxime", age: 28, ville: "Nice", budget_max: 620, profession: "Commercial", img: 53, bio: "Dynamique et organisé, j'aime les coloc conviviales avec des gens motivés.", interets: ["Mer", "Fitness", "Cuisine"], ambiance: ["Sociable"], rythme: ["Matinal"] },
  { prenom: "Inès", age: 22, ville: "Grenoble", budget_max: 460, profession: "Étudiante en bio", img: 44, bio: "Montagnarde dans l'âme, j'adore randonner le week-end. Coloc nature bienvenue !", interets: ["Rando", "Ski", "Écologie"], ambiance: ["Calme", "Sociable"], rythme: ["Matinale"] },
  { prenom: "Antoine", age: 29, ville: "Paris", budget_max: 800, profession: "Architecte", img: 60, bio: "Jeune actif soigné, je cherche une belle coloc dans un quartier vivant.", interets: ["Design", "Expos", "Vin"], ambiance: ["Détendu"], rythme: ["Flexible"], verifie: true },
  { prenom: "Jade", age: 21, ville: "Lyon", budget_max: 500, profession: "Étudiante en com'", img: 31, bio: "Pétillante et sociable, j'adore organiser des soirées à thème.", interets: ["Mode", "Photo", "Sorties"], ambiance: ["Fêtarde", "Sociable"], rythme: ["Noctambule"] },
  { prenom: "Romain", age: 24, ville: "Bordeaux", budget_max: 530, profession: "Œnologue", img: 11, bio: "Curieux et gourmand, je cuisine souvent. Coloc autour d'une bonne table ?", interets: ["Vin", "Cuisine", "Rugby"], ambiance: ["Sociable", "Détendu"], rythme: ["Flexible"] },
  { prenom: "Lola", age: 20, ville: "Toulouse", budget_max: 430, profession: "Étudiante en arts", img: 47, bio: "Artiste un peu bohème, j'aime les coloc créatives et ouvertes d'esprit.", interets: ["Peinture", "Musique", "Théâtre"], ambiance: ["Sociable"], rythme: ["Noctambule"] },
  { prenom: "Yanis", age: 26, ville: "Marseille", budget_max: 510, profession: "Coach sportif", img: 13, bio: "Sportif et de bonne humeur, je cherche une coloc fun au bord de la mer.", interets: ["Fitness", "Plage", "Cuisine"], ambiance: ["Sociable", "Fêtard"], rythme: ["Matinal"] },
  { prenom: "Emma", age: 23, ville: "Nantes", budget_max: 490, profession: "Professeure des écoles", img: 45, bio: "Douce et organisée, j'aime une coloc calme et chaleureuse.", interets: ["Lecture", "Pâtisserie", "Vélo"], ambiance: ["Calme"], rythme: ["Matinale"], verifie: true },
  { prenom: "Adam", age: 22, ville: "Lille", budget_max: 450, profession: "Étudiant en éco", img: 68, bio: "Cool et respectueux, je cherche une coloc sympa pas trop loin de la fac.", interets: ["Basket", "Séries", "Jeux"], ambiance: ["Sociable", "Détendu"], rythme: ["Flexible"] },
  { prenom: "Louise", age: 25, ville: "Montpellier", budget_max: 540, profession: "Chargée de projet", img: 49, bio: "Souriante et facile à vivre, j'adore les dîners partagés entre colocs.", interets: ["Cuisine", "Yoga", "Voyage"], ambiance: ["Sociable", "Calme"], rythme: ["Matinale"] },
  { prenom: "Mehdi", age: 27, ville: "Paris", budget_max: 700, profession: "Data analyst", img: 59, bio: "Posé et bosseur, télétravail régulier. Je cherche une coloc agréable et calme.", interets: ["Tech", "Échecs", "Course"], ambiance: ["Calme", "Détendu"], rythme: ["Flexible"], verifie: true },
];
const VITRINE: Profile[] = V.map((v, i) => ({
  id: `demo-${i + 1}`,
  role: "colocataire",
  prenom: v.prenom,
  age: v.age,
  ville: v.ville,
  budget_max: v.budget_max,
  profession: v.profession,
  bio: v.bio,
  interets: v.interets,
  ambiance: v.ambiance,
  rythme: v.rythme,
  photo_url: `https://i.pravatar.cc/512?img=${v.img}`,
  identite_verifiee: !!v.verifie,
})) as unknown as Profile[];

// Profils PUBLICS de colocataires en recherche de colocation (pour le site).
// RLS : lecture des profils autorisée à tous. On ne montre que ceux qui ont
// une photo (profil présentable).
export async function getColocatairesPublics(limit = 60): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "colocataire")
    .not("photo_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  const db = (data as Profile[]) ?? [];
  // Profils réels + profils vitrine (pour étoffer l'affichage du site)
  return [...db, ...VITRINE].slice(0, limit);
}

// Un profil colocataire public (pour la page profil du site).
export async function getColocatairePublic(id: string): Promise<Profile | null> {
  // Profil vitrine (apparence site)
  if (id.startsWith("demo-")) return VITRINE.find((p) => p.id === id) ?? null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "colocataire")
    .maybeSingle();
  return (data as Profile) ?? null;
}
