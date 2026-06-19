-- ============================================================================
-- Parrainage (vrai système côté serveur)
-- Un ami s'inscrit via ton lien ?ref=<ton id> -> il devient ton "filleul".
-- Récompense : +10 swipes/jour par filleul (calculé depuis le nombre de filleuls).
-- À coller dans Supabase : SQL Editor -> New query -> coller -> Run.
-- ============================================================================

create table if not exists public.parrainages (
  filleul_id uuid primary key references auth.users(id) on delete cascade,
  parrain_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint pas_soi_meme check (parrain_id <> filleul_id)
);

create index if not exists parrainages_parrain_idx on public.parrainages (parrain_id);

alter table public.parrainages enable row level security;

-- Le filleul enregistre LUI-MÊME son parrain, une seule fois (clé primaire).
drop policy if exists "Filleul cree son parrainage" on public.parrainages;
create policy "Filleul cree son parrainage" on public.parrainages
  for insert to authenticated
  with check (filleul_id = auth.uid() and parrain_id <> auth.uid());

-- On ne lit que les lignes qui nous concernent (mes filleuls ou mon parrain).
drop policy if exists "Lecture parrainages" on public.parrainages;
create policy "Lecture parrainages" on public.parrainages
  for select to authenticated
  using (parrain_id = auth.uid() or filleul_id = auth.uid());
