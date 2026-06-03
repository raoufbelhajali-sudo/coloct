-- ============================================================
-- Colock't — Étape 5 : swipes, matchs réciproques et messages
-- À coller dans Supabase : "SQL Editor" → "New query" → coller → "Run"
-- ============================================================

-- 1) Les swipes (j'aime / je passe)
--    - un COLOCATAIRE swipe une annonce        -> listing_id rempli, target_user_id vide
--    - un LOCATAIRE swipe un profil colocataire -> listing_id (son annonce) + target_user_id (le colocataire)
create table if not exists public.swipes (
  id bigint generated always as identity primary key,
  swiper_id uuid not null references auth.users(id) on delete cascade,
  listing_id bigint references public.listings(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now()
);

alter table public.swipes enable row level security;

drop policy if exists "Voir ses swipes" on public.swipes;
create policy "Voir ses swipes"
  on public.swipes for select using (auth.uid() = swiper_id);

drop policy if exists "Créer ses swipes" on public.swipes;
create policy "Créer ses swipes"
  on public.swipes for insert with check (auth.uid() = swiper_id);

-- 2) Les matchs (créés automatiquement quand les deux se sont likés)
create table if not exists public.matches (
  id bigint generated always as identity primary key,
  colocataire_id uuid not null references auth.users(id) on delete cascade,
  locataire_id uuid not null references auth.users(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (colocataire_id, listing_id)
);

alter table public.matches enable row level security;

drop policy if exists "Voir ses matchs" on public.matches;
create policy "Voir ses matchs"
  on public.matches for select
  using (auth.uid() = colocataire_id or auth.uid() = locataire_id);

-- 3) Les messages échangés dans un match
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  match_id bigint not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- On ne peut lire/écrire que dans les matchs dont on fait partie
drop policy if exists "Lire les messages de ses matchs" on public.messages;
create policy "Lire les messages de ses matchs"
  on public.messages for select using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (auth.uid() = m.colocataire_id or auth.uid() = m.locataire_id)
    )
  );

drop policy if exists "Écrire dans ses matchs" on public.messages;
create policy "Écrire dans ses matchs"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (auth.uid() = m.colocataire_id or auth.uid() = m.locataire_id)
    )
  );

-- 4) Création AUTOMATIQUE du match quand le like est réciproque
create or replace function public.handle_swipe()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid;
begin
  if new.direction <> 'like' then
    return new;
  end if;

  -- Cas A : un COLOCATAIRE a liké une annonce (target_user_id vide)
  if new.target_user_id is null and new.listing_id is not null then
    select owner_id into v_owner from public.listings where id = new.listing_id;
    if v_owner is not null and exists (
      select 1 from public.swipes s
      where s.swiper_id = v_owner
        and s.target_user_id = new.swiper_id
        and s.listing_id = new.listing_id
        and s.direction = 'like'
    ) then
      insert into public.matches (colocataire_id, locataire_id, listing_id)
      values (new.swiper_id, v_owner, new.listing_id)
      on conflict (colocataire_id, listing_id) do nothing;
    end if;

  -- Cas B : un LOCATAIRE a liké un colocataire (target_user_id rempli)
  elsif new.target_user_id is not null and new.listing_id is not null then
    if exists (
      select 1 from public.swipes s
      where s.swiper_id = new.target_user_id
        and s.listing_id = new.listing_id
        and s.target_user_id is null
        and s.direction = 'like'
    ) then
      insert into public.matches (colocataire_id, locataire_id, listing_id)
      values (new.target_user_id, new.swiper_id, new.listing_id)
      on conflict (colocataire_id, listing_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_swipe_created on public.swipes;
create trigger on_swipe_created
  after insert on public.swipes
  for each row execute function public.handle_swipe();
