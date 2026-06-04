-- Colock't — Ville + Département (recherche & annonces)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- Annonces : ville + département, et arrondissement/quartier deviennent facultatifs
alter table public.listings add column if not exists ville text;
alter table public.listings add column if not exists departement text;
alter table public.listings alter column arrondissement drop not null;
alter table public.listings alter column quartier drop not null;

-- Profils (recherche du colocataire)
alter table public.profiles add column if not exists ville text;
alter table public.profiles add column if not exists departement text;
