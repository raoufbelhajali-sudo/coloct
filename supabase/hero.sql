-- FlatSwiper — Marqueur HeroSwiper (forfait "le max")
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.profiles add column if not exists hero_until timestamptz;
