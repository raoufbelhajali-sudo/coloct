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

// Villes de France métropolitaine (ordre alphabétique) + leur département.
// Au moins une ville par département → tous les départements sont sélectionnables.
export const GRANDES_VILLES: { nom: string; dept: string }[] = [
  { nom: "Agen", dept: "47" },
  { nom: "Aix-en-Provence", dept: "13" },
  { nom: "Ajaccio", dept: "2A" },
  { nom: "Albi", dept: "81" },
  { nom: "Alençon", dept: "61" },
  { nom: "Amiens", dept: "80" },
  { nom: "Angers", dept: "49" },
  { nom: "Angoulême", dept: "16" },
  { nom: "Annecy", dept: "74" },
  { nom: "Argenteuil", dept: "95" },
  { nom: "Arras", dept: "62" },
  { nom: "Auch", dept: "32" },
  { nom: "Aurillac", dept: "15" },
  { nom: "Auxerre", dept: "89" },
  { nom: "Avignon", dept: "84" },
  { nom: "Bar-le-Duc", dept: "55" },
  { nom: "Bastia", dept: "2B" },
  { nom: "Bayonne", dept: "64" },
  { nom: "Beauvais", dept: "60" },
  { nom: "Belfort", dept: "90" },
  { nom: "Besançon", dept: "25" },
  { nom: "Blois", dept: "41" },
  { nom: "Bordeaux", dept: "33" },
  { nom: "Boulogne-Billancourt", dept: "92" },
  { nom: "Bourg-en-Bresse", dept: "01" },
  { nom: "Bourges", dept: "18" },
  { nom: "Brest", dept: "29" },
  { nom: "Brive-la-Gaillarde", dept: "19" },
  { nom: "Caen", dept: "14" },
  { nom: "Cahors", dept: "46" },
  { nom: "Carcassonne", dept: "11" },
  { nom: "Chambéry", dept: "73" },
  { nom: "Charleville-Mézières", dept: "08" },
  { nom: "Chartres", dept: "28" },
  { nom: "Châteauroux", dept: "36" },
  { nom: "Chaumont", dept: "52" },
  { nom: "Cherbourg-en-Cotentin", dept: "50" },
  { nom: "Clermont-Ferrand", dept: "63" },
  { nom: "Créteil", dept: "94" },
  { nom: "Digne-les-Bains", dept: "04" },
  { nom: "Dijon", dept: "21" },
  { nom: "Épinal", dept: "88" },
  { nom: "Évreux", dept: "27" },
  { nom: "Évry-Courcouronnes", dept: "91" },
  { nom: "Foix", dept: "09" },
  { nom: "Gap", dept: "05" },
  { nom: "Grenoble", dept: "38" },
  { nom: "Guéret", dept: "23" },
  { nom: "La Roche-sur-Yon", dept: "85" },
  { nom: "La Rochelle", dept: "17" },
  { nom: "Laval", dept: "53" },
  { nom: "Le Havre", dept: "76" },
  { nom: "Le Mans", dept: "72" },
  { nom: "Le Puy-en-Velay", dept: "43" },
  { nom: "Lille", dept: "59" },
  { nom: "Limoges", dept: "87" },
  { nom: "Lons-le-Saunier", dept: "39" },
  { nom: "Lyon", dept: "69" },
  { nom: "Mâcon", dept: "71" },
  { nom: "Marseille", dept: "13" },
  { nom: "Melun", dept: "77" },
  { nom: "Mende", dept: "48" },
  { nom: "Metz", dept: "57" },
  { nom: "Montauban", dept: "82" },
  { nom: "Mont-de-Marsan", dept: "40" },
  { nom: "Montluçon", dept: "03" },
  { nom: "Montpellier", dept: "34" },
  { nom: "Mulhouse", dept: "68" },
  { nom: "Nancy", dept: "54" },
  { nom: "Nantes", dept: "44" },
  { nom: "Nevers", dept: "58" },
  { nom: "Nice", dept: "06" },
  { nom: "Nîmes", dept: "30" },
  { nom: "Niort", dept: "79" },
  { nom: "Orléans", dept: "45" },
  { nom: "Paris", dept: "75" },
  { nom: "Pau", dept: "64" },
  { nom: "Périgueux", dept: "24" },
  { nom: "Perpignan", dept: "66" },
  { nom: "Poitiers", dept: "86" },
  { nom: "Privas", dept: "07" },
  { nom: "Reims", dept: "51" },
  { nom: "Rennes", dept: "35" },
  { nom: "Rodez", dept: "12" },
  { nom: "Roubaix", dept: "59" },
  { nom: "Rouen", dept: "76" },
  { nom: "Saint-Brieuc", dept: "22" },
  { nom: "Saint-Denis", dept: "93" },
  { nom: "Saint-Étienne", dept: "42" },
  { nom: "Saint-Quentin", dept: "02" },
  { nom: "Strasbourg", dept: "67" },
  { nom: "Tarbes", dept: "65" },
  { nom: "Toulon", dept: "83" },
  { nom: "Toulouse", dept: "31" },
  { nom: "Tours", dept: "37" },
  { nom: "Troyes", dept: "10" },
  { nom: "Valence", dept: "26" },
  { nom: "Vannes", dept: "56" },
  { nom: "Versailles", dept: "78" },
  { nom: "Vesoul", dept: "70" },
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

// Situation professionnelle (menu déroulant)
export const PROFESSIONS = ["Étudiant", "CDD", "CDI", "Chômeur", "Retraité"];

// Statut de l'annonceur vis-à-vis du logement
export const STATUTS_ANNONCEUR = [
  "Propriétaire",
  "Locataire (sous-location)",
  "Agence",
];

// Infos annonce
export const TYPES_LOGEMENT = ["Appartement", "Maison", "Studio"];
export const SALLES_DE_BAIN = ["Privée", "Partagée"];
export const DUREES_MIN_BAIL = [
  "Sans minimum",
  "3 mois minimum",
  "6 mois minimum",
  "1 an minimum",
];
export const GENRES_COLOC = ["Mixte", "Entre filles", "Entre garçons"];

// Profil colocataire enrichi
export const LANGUES = [
  "Français", "Anglais", "Arabe", "Espagnol", "Italien",
  "Allemand", "Portugais", "Chinois", "Autre",
];
export const NIVEAUX_SONORES = [
  "Plutôt calme",
  "Équilibré",
  "J'aime recevoir / faire la fête",
];
export const GENRES_COLOC_RECHERCHE = [
  "Indifférent",
  "Plutôt entre filles",
  "Plutôt entre garçons",
  "Coloc mixte",
];

// Durée de colocation souhaitée (colocataire)
export const DUREES_COLOC = [
  "Quelques semaines",
  "1 à 3 mois",
  "3 à 6 mois",
  "6 mois à 1 an",
  "1 an ou plus",
  "Indifférent",
];

// Questions "prompts" de profil (réponses libres, façon Tinder/Muzz)
export const PROMPTS = [
  "Le coloc idéal pour moi, c'est…",
  "Chez moi, le dimanche…",
  "Ce que j'apporte à une coloc…",
  "Mon petit plus…",
  "Ce que je ne supporte pas en coloc…",
  "Ma soirée parfaite à la maison…",
];

// Choix de mode de vie (stockés en booléens dans le profil)
export const TABAC = ["Non-fumeur", "Fumeur"];
export const ANIMAUX = ["J'aime les animaux", "Plutôt sans animaux"];
export const TELETRAVAIL = ["Je télétravaille", "Je travaille sur place"];
