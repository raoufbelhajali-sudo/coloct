-- FlatSwiper — Durée de colocation souhaitée (colocataire)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.profiles
  add column if not exists duree_coloc text;
