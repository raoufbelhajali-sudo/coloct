-- FlatSwiper — Profil colocataire enrichi (Vague 2)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.profiles add column if not exists langues text[] default '{}';
alter table public.profiles add column if not exists niveau_sonore text;            -- calme / équilibré / fêtard
alter table public.profiles add column if not exists genre_coloc_recherche text;    -- préférence de mixité
