-- ============================================================
-- Colock't — Étape 5a : comptes, rôles et profils
-- À coller dans Supabase : "SQL Editor" → "New query" → coller → "Run"
-- ============================================================

-- 1) Les deux rôles possibles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('locataire', 'colocataire');
  end if;
end $$;

-- 2) Table des profils (un profil par compte)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  prenom text not null,
  age integer,
  -- préférences propres au COLOCATAIRE (celui qui cherche)
  budget_max integer,
  quartiers text[] default '{}',
  date_emmenagement date,
  non_fumeur boolean default false,
  animaux boolean default false,
  teletravail boolean default false,
  -- petite présentation libre
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3) Règles d'accès aux profils
drop policy if exists "Lecture des profils" on public.profiles;
create policy "Lecture des profils"
  on public.profiles for select using (true);

drop policy if exists "Créer son profil" on public.profiles;
create policy "Créer son profil"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Modifier son profil" on public.profiles;
create policy "Modifier son profil"
  on public.profiles for update using (auth.uid() = id);

-- 4) On relie chaque annonce à son LOCATAIRE (propriétaire de l'annonce)
alter table public.listings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Un locataire peut créer / modifier ses propres annonces
drop policy if exists "Locataire crée ses annonces" on public.listings;
create policy "Locataire crée ses annonces"
  on public.listings for insert with check (auth.uid() = owner_id);

drop policy if exists "Locataire modifie ses annonces" on public.listings;
create policy "Locataire modifie ses annonces"
  on public.listings for update using (auth.uid() = owner_id);

-- 5) Création automatique du profil à l'inscription d'un compte.
--    Le rôle et le prénom sont transmis au moment de l'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, prenom)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'colocataire'),
    coalesce(new.raw_user_meta_data->>'prenom', 'Anonyme')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
