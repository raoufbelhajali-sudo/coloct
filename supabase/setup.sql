-- ============================================================
-- Colock't — Étape 4 : table des annonces + lecture publique
-- À coller dans Supabase : menu "SQL Editor" → "New query" → coller → "Run"
-- ============================================================

-- 1) La table qui stocke les annonces de colocation
create table if not exists public.listings (
  id bigint generated always as identity primary key,
  loyer integer not null,
  quartier text not null,
  arrondissement integer not null,
  date_dispo text not null,
  dispo date not null,
  surface integer not null,
  meuble boolean not null,
  etage text not null,
  colocs jsonb not null default '[]',
  criteres text[] not null default '{}',
  photos text[] not null default '{}',
  description text not null,
  created_at timestamptz not null default now()
);

-- 2) Sécurité : on active la protection ligne par ligne...
alter table public.listings enable row level security;

-- 3) ...puis on autorise TOUT LE MONDE à LIRE les annonces (mais pas à les modifier)
drop policy if exists "Lecture publique des annonces" on public.listings;
create policy "Lecture publique des annonces"
  on public.listings for select
  using (true);

-- 4) On vide la table avant d'insérer (au cas où on relance le script)
truncate table public.listings restart identity;

-- 5) Insertion des 10 annonces parisiennes :
insert into public.listings
  (loyer, quartier, arrondissement, date_dispo, dispo, surface, meuble, etage, colocs, criteres, photos, description)
values
  (750, 'Le Marais', 4, '1er juillet 2026', '2026-07-01', 14, true, '3e étage avec ascenseur', '[{"prenom":"Léa","age":26,"ambiance":"calme et créative"},{"prenom":"Hugo","age":28,"ambiance":"cuisine pour 10"}]'::jsonb, ARRAY['Non-fumeur', 'Télétravail friendly', 'Animaux bienvenus'], ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=70'], 'Chambre lumineuse dans un appart de charme en plein cœur du Marais, à deux pas des cafés et galeries.'),
  (620, 'Belleville', 20, '15 juin 2026', '2026-06-15', 12, true, '5e étage sans ascenseur', '[{"prenom":"Yasmine","age":24,"ambiance":"fêtarde et sociable"}]'::jsonb, ARRAY['Non-fumeur en intérieur', 'Soirées OK', 'Végé-friendly'], ARRAY['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=70'], 'Coloc jeune et vivante à Belleville, vue sur les toits de Paris depuis le balcon. Quartier vivant et arty.'),
  (690, 'Montmartre', 18, '1er septembre 2026', '2026-09-01', 13, false, '2e étage sans ascenseur', '[{"prenom":"Tom","age":27,"ambiance":"musicien tranquille"},{"prenom":"Inès","age":25,"ambiance":"lève-tôt sportive"}]'::jsonb, ARRAY['Non-fumeur', 'Pas d''animaux', 'Calme le soir'], ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=70'], 'Chambre non meublée au pied du Sacré-Cœur, ambiance village et marchés le week-end.'),
  (800, 'Bastille', 11, '1er juillet 2026', '2026-07-01', 16, true, '4e étage avec ascenseur', '[{"prenom":"Camille","age":29,"ambiance":"télétravail, très organisée"}]'::jsonb, ARRAY['Non-fumeur', 'Télétravail friendly', 'Chat sur place'], ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=70'], 'Grande chambre meublée près de Bastille, idéale pour télétravailleur. Coin bureau et fibre.'),
  (670, 'Canal Saint-Martin', 10, '20 juin 2026', '2026-06-20', 11, true, '1er étage sur cour', '[{"prenom":"Noé","age":23,"ambiance":"étudiant cool"},{"prenom":"Sarah","age":24,"ambiance":"yoga & brunchs"}]'::jsonb, ARRAY['Non-fumeur', 'Soirées tranquilles', 'Animaux bienvenus'], ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=70'], 'Petite chambre cosy à deux pas du Canal Saint-Martin, parfaite pour profiter des terrasses.'),
  (580, 'Quartier Latin', 5, '1er août 2026', '2026-08-01', 10, true, '6e étage avec ascenseur', '[{"prenom":"Antoine","age":22,"ambiance":"étudiant en médecine, studieux"}]'::jsonb, ARRAY['Non-fumeur', 'Calme (révisions)', 'Pas de soirées en semaine'], ARRAY['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=70'], 'Chambre étudiante au calme dans le Quartier Latin, proche des facs et de la Sorbonne.'),
  (730, 'Batignolles', 17, '10 juillet 2026', '2026-07-10', 15, false, '3e étage avec ascenseur', '[{"prenom":"Manon","age":30,"ambiance":"jardinage sur balcon"},{"prenom":"Karim","age":31,"ambiance":"cuisine du monde"}]'::jsonb, ARRAY['Non-fumeur', 'Télétravail friendly', 'Chien sur place'], ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=70'], 'Belle chambre dans un quartier familial et verdoyant, près du parc Martin Luther King.'),
  (640, 'Oberkampf', 11, '5 juin 2026', '2026-06-05', 12, true, '2e étage sur rue', '[{"prenom":"Jade","age":25,"ambiance":"noctambule, adore sortir"}]'::jsonb, ARRAY['Fumeur OK au balcon', 'Soirées OK', 'Végé-friendly'], ARRAY['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=70'], 'Chambre au cœur de la vie nocturne d''Oberkampf, pour ceux qui aiment l''animation.'),
  (700, 'Buttes-Chaumont', 19, '1er septembre 2026', '2026-09-01', 14, true, '4e étage avec ascenseur', '[{"prenom":"Lucas","age":27,"ambiance":"runner du dimanche"},{"prenom":"Emma","age":26,"ambiance":"télétravail, plantes partout"}]'::jsonb, ARRAY['Non-fumeur', 'Télétravail friendly', 'Animaux bienvenus'], ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70'], 'Chambre lumineuse face au parc des Buttes-Chaumont, idéale pour les amoureux du vert.'),
  (610, 'Pernety', 14, '25 juin 2026', '2026-06-25', 11, true, '5e étage avec ascenseur', '[{"prenom":"Chloé","age":28,"ambiance":"calme, télétravail"}]'::jsonb, ARRAY['Non-fumeur', 'Calme', 'Chat sur place'], ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=70', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=70'], 'Chambre paisible dans le 14e, quartier de village avec commerces et marché couvert.');
