-- FlatSwiper — Confiance (Vague 5) : actif récemment + avis/note
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) Dernière activité (pour le badge "Actif récemment")
alter table public.profiles add column if not exists last_seen timestamptz;

-- 2) Avis / notes entre membres
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewed_id uuid not null references auth.users(id) on delete cascade,
  note int not null check (note between 1 and 5),
  commentaire text,
  created_at timestamptz not null default now(),
  unique (reviewer_id, reviewed_id)
);

alter table public.reviews enable row level security;

-- Tout le monde peut lire les avis (pour calculer les moyennes affichées)
drop policy if exists "Lecture des avis" on public.reviews;
create policy "Lecture des avis" on public.reviews for select using (true);

-- On ne peut écrire/màj/supprimer que ses propres avis
drop policy if exists "Créer un avis" on public.reviews;
create policy "Créer un avis" on public.reviews for insert with check (auth.uid() = reviewer_id);

drop policy if exists "Modifier son avis" on public.reviews;
create policy "Modifier son avis" on public.reviews for update using (auth.uid() = reviewer_id);

drop policy if exists "Supprimer son avis" on public.reviews;
create policy "Supprimer son avis" on public.reviews for delete using (auth.uid() = reviewer_id);
