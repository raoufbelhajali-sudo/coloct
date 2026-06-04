// ============================================================
// Données fictives des annonces de colocation (MVP)
// Plus tard, ces données viendront de Supabase (le vrai serveur).
// ============================================================

// Un coloc déjà présent dans le logement
export type Coloc = {
  prenom: string;
  age: number;
  ambiance: string; // ex. "fêtarde", "calme", "sportive"
};

// Une annonce de chambre en colocation
export type Listing = {
  id: string;
  loyer: number; // loyer mensuel charges comprises (€)
  quartier: string;
  ville?: string | null; // ex. "Paris", "Saint-Denis"
  departement?: string | null; // numéro, ex. "75", "93"
  arrondissement: number | null; // ex. 11 pour le 11e (Paris uniquement)
  dateDispo: string; // date de disponibilité (texte lisible)
  dispo: string; // même date au format AAAA-MM-JJ (pour filtrer/comparer)
  surface: number; // surface de la chambre (m²)
  meuble: boolean; // meublé ou non
  etage: string; // ex. "3e étage avec ascenseur"
  colocs: Coloc[]; // qui vit déjà là
  criteres: string[]; // critères de vie commune
  photos: string[]; // URLs des photos
  description: string; // courte description
  boosted_until?: string | null; // annonce mise en avant jusqu'à cette date
};

// Petite fonction utilitaire pour construire l'URL d'une photo Unsplash
function photo(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;
}

export const listings: Listing[] = [
  {
    id: "1",
    loyer: 750,
    quartier: "Le Marais",
    arrondissement: 4,
    dateDispo: "1er juillet 2026",
    dispo: "2026-07-01",
    surface: 14,
    meuble: true,
    etage: "3e étage avec ascenseur",
    colocs: [
      { prenom: "Léa", age: 26, ambiance: "calme et créative" },
      { prenom: "Hugo", age: 28, ambiance: "cuisine pour 10" },
    ],
    criteres: ["Non-fumeur", "Télétravail friendly", "Animaux bienvenus"],
    photos: [photo("1522708323590-d24dbb6b0267"), photo("1493809842364-78817add7ffb")],
    description:
      "Chambre lumineuse dans un appart de charme en plein cœur du Marais, à deux pas des cafés et galeries.",
  },
  {
    id: "2",
    loyer: 620,
    quartier: "Belleville",
    arrondissement: 20,
    dateDispo: "15 juin 2026",
    dispo: "2026-06-15",
    surface: 12,
    meuble: true,
    etage: "5e étage sans ascenseur",
    colocs: [{ prenom: "Yasmine", age: 24, ambiance: "fêtarde et sociable" }],
    criteres: ["Non-fumeur en intérieur", "Soirées OK", "Végé-friendly"],
    photos: [photo("1505691938895-1758d7feb511"), photo("1502005229762-cf1b2da7c5d6")],
    description:
      "Coloc jeune et vivante à Belleville, vue sur les toits de Paris depuis le balcon. Quartier vivant et arty.",
  },
  {
    id: "3",
    loyer: 690,
    quartier: "Montmartre",
    arrondissement: 18,
    dateDispo: "1er septembre 2026",
    dispo: "2026-09-01",
    surface: 13,
    meuble: false,
    etage: "2e étage sans ascenseur",
    colocs: [
      { prenom: "Tom", age: 27, ambiance: "musicien tranquille" },
      { prenom: "Inès", age: 25, ambiance: "lève-tôt sportive" },
    ],
    criteres: ["Non-fumeur", "Pas d'animaux", "Calme le soir"],
    photos: [photo("1502672260266-1c1ef2d93688"), photo("1567767292278-a4f21aa2d36e")],
    description:
      "Chambre non meublée au pied du Sacré-Cœur, ambiance village et marchés le week-end.",
  },
  {
    id: "4",
    loyer: 800,
    quartier: "Bastille",
    arrondissement: 11,
    dateDispo: "1er juillet 2026",
    dispo: "2026-07-01",
    surface: 16,
    meuble: true,
    etage: "4e étage avec ascenseur",
    colocs: [{ prenom: "Camille", age: 29, ambiance: "télétravail, très organisée" }],
    criteres: ["Non-fumeur", "Télétravail friendly", "Chat sur place"],
    photos: [photo("1554995207-c18c203602cb"), photo("1556912172-45b7abe8b7e1")],
    description:
      "Grande chambre meublée près de Bastille, idéale pour télétravailleur. Coin bureau et fibre.",
  },
  {
    id: "5",
    loyer: 670,
    quartier: "Canal Saint-Martin",
    arrondissement: 10,
    dateDispo: "20 juin 2026",
    dispo: "2026-06-20",
    surface: 11,
    meuble: true,
    etage: "1er étage sur cour",
    colocs: [
      { prenom: "Noé", age: 23, ambiance: "étudiant cool" },
      { prenom: "Sarah", age: 24, ambiance: "yoga & brunchs" },
    ],
    criteres: ["Non-fumeur", "Soirées tranquilles", "Animaux bienvenus"],
    photos: [photo("1560448204-e02f11c3d0e2"), photo("1484154218962-a197022b5858")],
    description:
      "Petite chambre cosy à deux pas du Canal Saint-Martin, parfaite pour profiter des terrasses.",
  },
  {
    id: "6",
    loyer: 580,
    quartier: "Quartier Latin",
    arrondissement: 5,
    dateDispo: "1er août 2026",
    dispo: "2026-08-01",
    surface: 10,
    meuble: true,
    etage: "6e étage avec ascenseur",
    colocs: [{ prenom: "Antoine", age: 22, ambiance: "étudiant en médecine, studieux" }],
    criteres: ["Non-fumeur", "Calme (révisions)", "Pas de soirées en semaine"],
    photos: [photo("1502005229762-cf1b2da7c5d6"), photo("1505691938895-1758d7feb511")],
    description:
      "Chambre étudiante au calme dans le Quartier Latin, proche des facs et de la Sorbonne.",
  },
  {
    id: "7",
    loyer: 730,
    quartier: "Batignolles",
    arrondissement: 17,
    dateDispo: "10 juillet 2026",
    dispo: "2026-07-10",
    surface: 15,
    meuble: false,
    etage: "3e étage avec ascenseur",
    colocs: [
      { prenom: "Manon", age: 30, ambiance: "jardinage sur balcon" },
      { prenom: "Karim", age: 31, ambiance: "cuisine du monde" },
    ],
    criteres: ["Non-fumeur", "Télétravail friendly", "Chien sur place"],
    photos: [photo("1540518614846-7eded433c457"), photo("1522771739844-6a9f6d5f14af")],
    description:
      "Belle chambre dans un quartier familial et verdoyant, près du parc Martin Luther King.",
  },
  {
    id: "8",
    loyer: 640,
    quartier: "Oberkampf",
    arrondissement: 11,
    dateDispo: "5 juin 2026",
    dispo: "2026-06-05",
    surface: 12,
    meuble: true,
    etage: "2e étage sur rue",
    colocs: [{ prenom: "Jade", age: 25, ambiance: "noctambule, adore sortir" }],
    criteres: ["Fumeur OK au balcon", "Soirées OK", "Végé-friendly"],
    photos: [photo("1493663284031-b7e3aefcae8e"), photo("1554995207-c18c203602cb")],
    description:
      "Chambre au cœur de la vie nocturne d'Oberkampf, pour ceux qui aiment l'animation.",
  },
  {
    id: "9",
    loyer: 700,
    quartier: "Buttes-Chaumont",
    arrondissement: 19,
    dateDispo: "1er septembre 2026",
    dispo: "2026-09-01",
    surface: 14,
    meuble: true,
    etage: "4e étage avec ascenseur",
    colocs: [
      { prenom: "Lucas", age: 27, ambiance: "runner du dimanche" },
      { prenom: "Emma", age: 26, ambiance: "télétravail, plantes partout" },
    ],
    criteres: ["Non-fumeur", "Télétravail friendly", "Animaux bienvenus"],
    photos: [photo("1586023492125-27b2c045efd7"), photo("1560448204-e02f11c3d0e2")],
    description:
      "Chambre lumineuse face au parc des Buttes-Chaumont, idéale pour les amoureux du vert.",
  },
  {
    id: "10",
    loyer: 610,
    quartier: "Pernety",
    arrondissement: 14,
    dateDispo: "25 juin 2026",
    dispo: "2026-06-25",
    surface: 11,
    meuble: true,
    etage: "5e étage avec ascenseur",
    colocs: [{ prenom: "Chloé", age: 28, ambiance: "calme, télétravail" }],
    criteres: ["Non-fumeur", "Calme", "Chat sur place"],
    photos: [photo("1598928506311-c55ded91a20c"), photo("1502672260266-1c1ef2d93688")],
    description:
      "Chambre paisible dans le 14e, quartier de village avec commerces et marché couvert.",
  },
];
