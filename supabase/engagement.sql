-- FlatSwiper — Engagement (Vague 3) : favoris + coup de cœur + annuler un swipe
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) Coup de cœur (super like) : marqueur sur le swipe
alter table public.swipes add column if not exists super boolean not null default false;

-- 2) Autoriser un utilisateur à SUPPRIMER ses propres swipes (pour "annuler")
drop policy if exists "Supprimer ses swipes" on public.swipes;
create policy "Supprimer ses swipes"
  on public.swipes for delete
  using (auth.uid() = swiper_id);

-- 3) Favoris (annonces sauvegardées par un colocataire)
create table if not exists public.favoris (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.favoris enable row level security;

drop policy if exists "Voir ses favoris" on public.favoris;
create policy "Voir ses favoris"
  on public.favoris for select using (auth.uid() = user_id);

drop policy if exists "Ajouter un favori" on public.favoris;
create policy "Ajouter un favori"
  on public.favoris for insert with check (auth.uid() = user_id);

drop policy if exists "Retirer un favori" on public.favoris;
create policy "Retirer un favori"
  on public.favoris for delete using (auth.uid() = user_id);
