// Options proposées pour les profils (partagées entre l'inscription et /profil)

export const INTERETS = [
  // Sport & bien-être
  "Sport", "Fitness", "Course à pied", "Vélo", "Randonnée", "Yoga",
  "Danse", "Natation", "Escalade", "Foot",
  // Culture & sorties
  "Musique", "Concerts", "Festivals", "Cinéma", "Séries", "Théâtre",
  "Lecture", "Photographie", "Art", "Musées",
  // Food & boissons
  "Cuisine", "Pâtisserie", "Brunch", "Vin", "Café", "Bières",
  // Maison & nature
  "Voyages", "Nature", "Jardinage", "Écologie", "Animaux", "Plantes",
  // Loisirs
  "Jeux vidéo", "Jeux de société", "Tech", "Mode", "Bénévolat",
  "Méditation", "Sorties", "Podcasts", "Bricolage",
];

export const AMBIANCES = [
  "Calme", "Sociable", "Fêtard·e", "Discret·e", "Convivial·e",
  "Indépendant·e", "Casanier·ère", "Bon vivant·e",
];

export const RYTHMES = [
  "Matinal·e", "Couche-tôt", "Noctambule", "Couche-tard",
  "Flexible", "Horaires décalés",
];

// Choix de mode de vie (stockés en booléens dans le profil)
export const TABAC = ["Non-fumeur", "Fumeur"];
export const ANIMAUX = ["J'aime les animaux", "Plutôt sans animaux"];
export const TELETRAVAIL = ["Je télétravaille", "Je travaille sur place"];
