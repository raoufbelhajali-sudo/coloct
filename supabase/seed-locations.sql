-- Annonces de LOCATION (logement entier) de démo, pour peupler le site.
-- À lancer une seule fois dans Supabase → SQL Editor.
insert into public.listings
  (titre, loyer, quartier, ville, departement, date_dispo, dispo, surface,
   meuble, etage, criteres, services, photos, description,
   type_offre, type_logement, caution, lat, lng)
values
  ('Studio lumineux République', 850, 'République', 'Paris', '75',
   '1 juillet 2026', '2026-07-01', 26, true, '4e avec ascenseur',
   ARRAY['Non-fumeur','Télétravail friendly'], ARRAY['Wifi inclus','Chauffage compris'],
   ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=70'],
   'Joli studio meublé en plein cœur de Paris, proche métro République. Idéal pour une personne.',
   'location', 'Studio', 1700, 48.867, 2.363),

  ('T2 cosy Croix-Rousse', 720, 'Croix-Rousse', 'Lyon', '69',
   '15 juillet 2026', '2026-07-15', 42, false, '2e sans ascenseur',
   ARRAY['Animaux bienvenus','Calme'], ARRAY['Cave','Local vélo'],
   ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70'],
   'Appartement T2 vide dans le quartier vivant de la Croix-Rousse, vue dégagée.',
   'location', 'Appartement', 1440, 45.774, 4.829),

  ('Appartement T3 Chartrons', 980, 'Chartrons', 'Bordeaux', '33',
   '1 août 2026', '2026-08-01', 65, false, '1er sur cour',
   ARRAY['Non-fumeur','Télétravail friendly'], ARRAY['Parking','Cave'],
   ARRAY['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=70'],
   'Grand T3 au calme dans le quartier des Chartrons, proche des quais.',
   'location', 'Appartement', 1960, 44.853, -0.573),

  ('Studio meublé Vieux-Port', 690, 'Vieux-Port', 'Marseille', '13',
   '20 juin 2026', '2026-06-20', 24, true, '3e avec ascenseur',
   ARRAY['Non-fumeur'], ARRAY['Wifi inclus','Climatisation'],
   ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=70'],
   'Studio meublé à deux pas du Vieux-Port, lumineux et bien agencé.',
   'location', 'Studio', 1380, 43.295, 5.374),

  ('T2 rénové Vieux-Lille', 760, 'Vieux-Lille', 'Lille', '59',
   '5 juillet 2026', '2026-07-05', 45, true, '2e avec ascenseur',
   ARRAY['Non-fumeur','Calme'], ARRAY['Chauffage compris','Wifi inclus'],
   ARRAY['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=70'],
   'T2 entièrement rénové et meublé dans le charmant Vieux-Lille.',
   'location', 'Appartement', 1520, 50.642, 3.063),

  ('Maison T4 avec jardin', 1250, 'Centre', 'Nantes', '44',
   '1 septembre 2026', '2026-09-01', 95, false, 'Maison de plain-pied',
   ARRAY['Animaux bienvenus','Télétravail friendly'], ARRAY['Jardin','Parking'],
   ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70'],
   'Maison familiale avec jardin, proche centre de Nantes et écoles.',
   'location', 'Maison', 2500, 47.218, -1.553),

  ('Studio étudiant Capitole', 580, 'Capitole', 'Toulouse', '31',
   '25 août 2026', '2026-08-25', 20, true, '5e avec ascenseur',
   ARRAY['Non-fumeur','Calme'], ARRAY['Wifi inclus'],
   ARRAY['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70'],
   'Studio meublé idéal étudiant, à deux pas de la place du Capitole.',
   'location', 'Studio', 1160, 43.604, 1.444),

  ('T2 vue mer Promenade', 1100, 'Promenade des Anglais', 'Nice', '06',
   '10 juillet 2026', '2026-07-10', 48, true, '6e avec ascenseur',
   ARRAY['Non-fumeur'], ARRAY['Climatisation','Wifi inclus','Balcon'],
   ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=70','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=70'],
   'Appartement meublé avec vue mer sur la Promenade des Anglais.',
   'location', 'Appartement', 2200, 43.695, 7.265);
