// Options proposées pour les profils (partagées entre l'inscription et /profil)

export const INTERETS = [
  // Sport & bien-être
  "Sport", "Fitness", "Course à pied", "Vélo", "Randonnée", "Yoga",
  "Danse", "Natation", "Escalade", "Foot", "Tennis", "Boxe", "Ski",
  "Surf", "Pilates", "Marche",
  // Culture & sorties
  "Musique", "Concerts", "Festivals", "Cinéma", "Séries", "Théâtre",
  "Lecture", "Photographie", "Art", "Musées", "Expos", "Karaoké",
  "Vinyles", "Stand-up",
  // Food & boissons
  "Cuisine", "Pâtisserie", "Brunch", "Vin", "Café", "Bières",
  "Restos", "Apéros",
  // Maison & nature
  "Voyages", "Nature", "Jardinage", "Écologie", "Animaux", "Plantes",
  "Camping", "Mer", "Montagne",
  // Loisirs & autres
  "Jeux vidéo", "Jeux de société", "Tech", "Mode", "Bénévolat",
  "Méditation", "Sorties", "Podcasts", "Bricolage", "Langues",
  "Entrepreneuriat", "Astronomie", "DIY", "Mode durable",
];

export const AMBIANCES = [
  "Calme", "Sociable", "Fêtard·e", "Discret·e", "Convivial·e",
  "Indépendant·e", "Casanier·ère", "Bon vivant·e", "Organisé·e",
  "Détendu·e", "Écolo", "Esprit famille",
];

export const RYTHMES = [
  "Matinal·e", "Couche-tôt", "Noctambule", "Couche-tard",
  "Flexible", "Horaires décalés", "Télétravail", "Souvent absent·e",
];

// Départements d'Île-de-France (numéros uniquement, pas d'option vide)
export const DEPARTEMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

// Grandes villes de France (ordre alphabétique) + leur département
export const GRANDES_VILLES: { nom: string; dept: string }[] = [
  { nom: "Aix-en-Provence", dept: "13" },
  { nom: "Amiens", dept: "80" },
  { nom: "Angers", dept: "49" },
  { nom: "Annecy", dept: "74" },
  { nom: "Argenteuil", dept: "95" },
  { nom: "Avignon", dept: "84" },
  { nom: "Besançon", dept: "25" },
  { nom: "Bordeaux", dept: "33" },
  { nom: "Boulogne-Billancourt", dept: "92" },
  { nom: "Brest", dept: "29" },
  { nom: "Caen", dept: "14" },
  { nom: "Clermont-Ferrand", dept: "63" },
  { nom: "Dijon", dept: "21" },
  { nom: "Grenoble", dept: "38" },
  { nom: "Le Havre", dept: "76" },
  { nom: "Le Mans", dept: "72" },
  { nom: "Lille", dept: "59" },
  { nom: "Limoges", dept: "87" },
  { nom: "Lyon", dept: "69" },
  { nom: "Marseille", dept: "13" },
  { nom: "Metz", dept: "57" },
  { nom: "Montpellier", dept: "34" },
  { nom: "Mulhouse", dept: "68" },
  { nom: "Nancy", dept: "54" },
  { nom: "Nantes", dept: "44" },
  { nom: "Nice", dept: "06" },
  { nom: "Nîmes", dept: "30" },
  { nom: "Orléans", dept: "45" },
  { nom: "Paris", dept: "75" },
  { nom: "Perpignan", dept: "66" },
  { nom: "Reims", dept: "51" },
  { nom: "Rennes", dept: "35" },
  { nom: "Roubaix", dept: "59" },
  { nom: "Rouen", dept: "76" },
  { nom: "Saint-Denis", dept: "93" },
  { nom: "Saint-Étienne", dept: "42" },
  { nom: "Strasbourg", dept: "67" },
  { nom: "Toulon", dept: "83" },
  { nom: "Toulouse", dept: "31" },
  { nom: "Tours", dept: "37" },
  { nom: "Villeurbanne", dept: "69" },
];

// Tous les départements français (numéro + nom)
export const DEPARTEMENTS_NOMS: { num: string; nom: string }[] = [
  { num: "01", nom: "Ain" }, { num: "02", nom: "Aisne" }, { num: "03", nom: "Allier" },
  { num: "04", nom: "Alpes-de-Haute-Provence" }, { num: "05", nom: "Hautes-Alpes" },
  { num: "06", nom: "Alpes-Maritimes" }, { num: "07", nom: "Ardèche" }, { num: "08", nom: "Ardennes" },
  { num: "09", nom: "Ariège" }, { num: "10", nom: "Aube" }, { num: "11", nom: "Aude" },
  { num: "12", nom: "Aveyron" }, { num: "13", nom: "Bouches-du-Rhône" }, { num: "14", nom: "Calvados" },
  { num: "15", nom: "Cantal" }, { num: "16", nom: "Charente" }, { num: "17", nom: "Charente-Maritime" },
  { num: "18", nom: "Cher" }, { num: "19", nom: "Corrèze" }, { num: "2A", nom: "Corse-du-Sud" },
  { num: "2B", nom: "Haute-Corse" }, { num: "21", nom: "Côte-d'Or" }, { num: "22", nom: "Côtes-d'Armor" },
  { num: "23", nom: "Creuse" }, { num: "24", nom: "Dordogne" }, { num: "25", nom: "Doubs" },
  { num: "26", nom: "Drôme" }, { num: "27", nom: "Eure" }, { num: "28", nom: "Eure-et-Loir" },
  { num: "29", nom: "Finistère" }, { num: "30", nom: "Gard" }, { num: "31", nom: "Haute-Garonne" },
  { num: "32", nom: "Gers" }, { num: "33", nom: "Gironde" }, { num: "34", nom: "Hérault" },
  { num: "35", nom: "Ille-et-Vilaine" }, { num: "36", nom: "Indre" }, { num: "37", nom: "Indre-et-Loire" },
  { num: "38", nom: "Isère" }, { num: "39", nom: "Jura" }, { num: "40", nom: "Landes" },
  { num: "41", nom: "Loir-et-Cher" }, { num: "42", nom: "Loire" }, { num: "43", nom: "Haute-Loire" },
  { num: "44", nom: "Loire-Atlantique" }, { num: "45", nom: "Loiret" }, { num: "46", nom: "Lot" },
  { num: "47", nom: "Lot-et-Garonne" }, { num: "48", nom: "Lozère" }, { num: "49", nom: "Maine-et-Loire" },
  { num: "50", nom: "Manche" }, { num: "51", nom: "Marne" }, { num: "52", nom: "Haute-Marne" },
  { num: "53", nom: "Mayenne" }, { num: "54", nom: "Meurthe-et-Moselle" }, { num: "55", nom: "Meuse" },
  { num: "56", nom: "Morbihan" }, { num: "57", nom: "Moselle" }, { num: "58", nom: "Nièvre" },
  { num: "59", nom: "Nord" }, { num: "60", nom: "Oise" }, { num: "61", nom: "Orne" },
  { num: "62", nom: "Pas-de-Calais" }, { num: "63", nom: "Puy-de-Dôme" }, { num: "64", nom: "Pyrénées-Atlantiques" },
  { num: "65", nom: "Hautes-Pyrénées" }, { num: "66", nom: "Pyrénées-Orientales" }, { num: "67", nom: "Bas-Rhin" },
  { num: "68", nom: "Haut-Rhin" }, { num: "69", nom: "Rhône" }, { num: "70", nom: "Haute-Saône" },
  { num: "71", nom: "Saône-et-Loire" }, { num: "72", nom: "Sarthe" }, { num: "73", nom: "Savoie" },
  { num: "74", nom: "Haute-Savoie" }, { num: "75", nom: "Paris" }, { num: "76", nom: "Seine-Maritime" },
  { num: "77", nom: "Seine-et-Marne" }, { num: "78", nom: "Yvelines" }, { num: "79", nom: "Deux-Sèvres" },
  { num: "80", nom: "Somme" }, { num: "81", nom: "Tarn" }, { num: "82", nom: "Tarn-et-Garonne" },
  { num: "83", nom: "Var" }, { num: "84", nom: "Vaucluse" }, { num: "85", nom: "Vendée" },
  { num: "86", nom: "Vienne" }, { num: "87", nom: "Haute-Vienne" }, { num: "88", nom: "Vosges" },
  { num: "89", nom: "Yonne" }, { num: "90", nom: "Territoire de Belfort" }, { num: "91", nom: "Essonne" },
  { num: "92", nom: "Hauts-de-Seine" }, { num: "93", nom: "Seine-Saint-Denis" }, { num: "94", nom: "Val-de-Marne" },
  { num: "95", nom: "Val-d'Oise" }, { num: "971", nom: "Guadeloupe" }, { num: "972", nom: "Martinique" },
  { num: "973", nom: "Guyane" }, { num: "974", nom: "La Réunion" }, { num: "976", nom: "Mayotte" },
];

// Tranches de salaire (net / mois) — pour le profil colocataire
export const SALAIRES = [
  "Moins de 1 500 €",
  "1 500 – 2 500 €",
  "2 500 – 3 500 €",
  "3 500 – 5 000 €",
  "Plus de 5 000 €",
];

// Services / équipements compris dans la colocation (annonce)
export const SERVICES = [
  "Place de parking",
  "Wifi / Internet",
  "Charges comprises",
  "Eau comprise",
  "Électricité comprise",
  "Chauffage compris",
  "Lave-linge",
  "Cuisine équipée",
];

// Choix de mode de vie (stockés en booléens dans le profil)
export const TABAC = ["Non-fumeur", "Fumeur"];
export const ANIMAUX = ["J'aime les animaux", "Plutôt sans animaux"];
export const TELETRAVAIL = ["Je télétravaille", "Je travaille sur place"];
