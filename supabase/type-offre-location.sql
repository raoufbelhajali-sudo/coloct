-- Type d'offre sur les annonces : "colocation" (chambre en coloc) ou "location"
-- (logement entier). Les annonces existantes deviennent "colocation".
-- À coller dans Supabase → SQL Editor → New query → Run.
alter table listings
  add column if not exists type_offre text not null default 'colocation';
