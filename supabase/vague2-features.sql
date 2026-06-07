-- FlatSwiper — Vague 2 : prompts de profil + distance (coordonnées)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) PROMPTS de profil (réponses libres à des questions) — objet JSON
alter table public.profiles
  add column if not exists prompts jsonb not null default '{}'::jsonb;

-- 2) DISTANCE : coordonnées géographiques de l'annonce (remplies à la création)
alter table public.listings add column if not exists lat double precision;
alter table public.listings add column if not exists lng double precision;
