-- FlatSwiper — Statut de l'annonceur vis-à-vis du bien (propriétaire / locataire)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.listings
  add column if not exists statut_annonceur text;
