-- ============================================================
--  Blog / Entraide FlatSwiper — forum & questions-réponses
--  Lecture publique. Écriture réservée aux comptes connectés.
--  À coller dans Supabase → SQL Editor → Run (idempotent).
-- ============================================================

-- Sujets (questions / discussions)
create table if not exists public.forum_sujets (
  id bigint generated always as identity primary key,
  auteur_id uuid references auth.users(id) on delete set null,
  titre text not null,
  contenu text not null,
  categorie text not null default 'Général',
  created_at timestamptz not null default now()
);

-- Réponses à un sujet
create table if not exists public.forum_reponses (
  id bigint generated always as identity primary key,
  sujet_id bigint not null references public.forum_sujets(id) on delete cascade,
  auteur_id uuid references auth.users(id) on delete set null,
  contenu text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_sujets enable row level security;
alter table public.forum_reponses enable row level security;

-- Lecture publique (tout le monde peut lire le forum)
drop policy if exists "Lecture sujets" on public.forum_sujets;
create policy "Lecture sujets" on public.forum_sujets for select using (true);
drop policy if exists "Lecture réponses" on public.forum_reponses;
create policy "Lecture réponses" on public.forum_reponses for select using (true);

-- Écriture : uniquement connecté, et en tant qu'auteur
drop policy if exists "Créer un sujet" on public.forum_sujets;
create policy "Créer un sujet" on public.forum_sujets
  for insert with check (auth.uid() = auteur_id);
drop policy if exists "Créer une réponse" on public.forum_reponses;
create policy "Créer une réponse" on public.forum_reponses
  for insert with check (auth.uid() = auteur_id);

-- Chacun peut supprimer son propre contenu
drop policy if exists "Supprimer son sujet" on public.forum_sujets;
create policy "Supprimer son sujet" on public.forum_sujets
  for delete using (auth.uid() = auteur_id);
drop policy if exists "Supprimer sa réponse" on public.forum_reponses;
create policy "Supprimer sa réponse" on public.forum_reponses
  for delete using (auth.uid() = auteur_id);

-- ============ Contenu de départ (auteur = Équipe FlatSwiper) ============
insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select v.auteur_id, v.titre, v.contenu, v.categorie
from (values
  (null::uuid,
   'Comment bien choisir ses colocataires ?',
   'On cherche souvent le bon logement, mais le plus important c''est avec QUI on vit. Quels critères regardez-vous en priorité : le rythme de vie, la propreté, le budget, les affinités ? Partagez vos astuces !',
   'Trouver une coloc'),
  (null::uuid,
   'Qui doit faire l''état des lieux en colocation ?',
   'En arrivant dans une coloc, faut-il refaire un état des lieux pour le nouvel arrivant ? Comment ça se passe avec le propriétaire et les colocataires déjà en place ?',
   'Bail & démarches'),
  (null::uuid,
   'Comment partager les charges équitablement ?',
   'Loyer, électricité, internet, courses communes… Comment vous organisez-vous pour que ce soit juste pour tout le monde ? Appli de comptes partagés, pot commun, règle au prorata ?',
   'Budget & charges'),
  (null::uuid,
   'Vos astuces pour une bonne ambiance en coloc ?',
   'Une coloc qui marche, c''est aussi une bonne entente. Repas communs, planning de ménage, soirées… Qu''est-ce qui fait, selon vous, une colocation où il fait bon vivre ?',
   'Vie en colocation')
) as v(auteur_id, titre, contenu, categorie)
where not exists (select 1 from public.forum_sujets);

-- Une réponse d'amorce sur le premier sujet
insert into public.forum_reponses (auteur_id, sujet_id, contenu)
select null, s.id,
  'Astuce : sur FlatSwiper, le swipe te montre déjà la compatibilité (budget, rythme, ambiance). Mais rien ne remplace un petit appel ou une visite avant de se décider !'
from public.forum_sujets s
where s.titre = 'Comment bien choisir ses colocataires ?'
  and not exists (select 1 from public.forum_reponses);
