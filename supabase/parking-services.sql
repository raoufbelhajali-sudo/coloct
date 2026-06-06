-- Colock't — Place de parking (colocataire) + services compris (annonce)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- Colocataire : souhaite une place de parking
alter table public.profiles
  add column if not exists parking_souhaite boolean not null default false;

-- Annonce : services compris + autres frais
alter table public.listings
  add column if not exists services text[] not null default '{}';
alter table public.listings
  add column if not exists autres_frais text;
