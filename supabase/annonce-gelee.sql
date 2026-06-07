-- FlatSwiper — Geler une annonce (bien loué)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.listings
  add column if not exists gelee boolean not null default false;
