-- FlatSwiper — Vague 1 : signalements + accusés de lecture
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) SIGNALEMENTS (report d'un profil)
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  raison text not null,
  details text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- On peut créer un signalement (en tant que reporter), mais pas lire ceux des autres
drop policy if exists "Créer un signalement" on public.reports;
create policy "Créer un signalement"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Voir ses signalements" on public.reports;
create policy "Voir ses signalements"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- 2) ACCUSÉS DE LECTURE : date de dernière lecture de chaque membre du match
alter table public.matches
  add column if not exists lu_colocataire_at timestamptz;
alter table public.matches
  add column if not exists lu_locataire_at timestamptz;
