-- Colock't — Nombre de personnes occupant le logement (annonce)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.listings add column if not exists nb_occupants integer;
