-- Colock't — Tranche d'âge recherchée (recherche du colocataire)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.profiles add column if not exists age_min integer;
alter table public.profiles add column if not exists age_max integer;
