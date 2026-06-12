-- Profil ENTREPRISE (agence) : un annonceur peut être une agence.
-- On réutilise `prenom` = nom de l'agence et `photo_url` = logo (pour que
-- l'affichage existant fonctionne), + ces colonnes dédiées.
alter table public.profiles
  add column if not exists est_agence boolean not null default false,
  add column if not exists statut_annonceur text,         -- Propriétaire / Locataire / Agence
  add column if not exists siret text,
  add column if not exists contact_tel text,
  add column if not exists site_web text;
