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
