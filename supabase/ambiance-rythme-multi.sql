-- Colock't — Ambiance & Rythme en choix multiple (liste)
-- À coller dans Supabase : SQL Editor → New query → coller → Run
-- Convertit les colonnes texte en listes (les valeurs existantes deviennent
-- des listes d'un seul élément).

alter table public.profiles
  alter column ambiance type text[]
  using (case when ambiance is null then null else array[ambiance] end);

alter table public.profiles
  alter column rythme type text[]
  using (case when rythme is null then null else array[rythme] end);
