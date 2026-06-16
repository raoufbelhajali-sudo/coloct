-- Pack Super Annonceur (entreprise/agence : publier plusieurs annonces).
-- À exécuter une fois dans Supabase → SQL Editor.
alter table profiles
  add column if not exists super_annonceur_until timestamptz;
