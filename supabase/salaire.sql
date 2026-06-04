-- Colock't — Tranche de salaire (profil colocataire)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.profiles add column if not exists salaire text;
