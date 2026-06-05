-- Colock't — Bloquer un profil + supprimer une discussion
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) Table des blocages
create table if not exists public.blocks (
  id bigint generated always as identity primary key,
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "Voir mes blocages" on public.blocks;
create policy "Voir mes blocages" on public.blocks for select
  using (auth.uid() = blocker_id or auth.uid() = blocked_id);

drop policy if exists "Creer mes blocages" on public.blocks;
create policy "Creer mes blocages" on public.blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists "Supprimer mes blocages" on public.blocks;
create policy "Supprimer mes blocages" on public.blocks for delete
  using (auth.uid() = blocker_id);

-- 2) Autoriser un membre à supprimer sa discussion (le match)
drop policy if exists "Supprimer ses matchs" on public.matches;
create policy "Supprimer ses matchs" on public.matches for delete
  using (auth.uid() = colocataire_id or auth.uid() = locataire_id);
