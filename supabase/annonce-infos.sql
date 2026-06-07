-- FlatSwiper — Infos annonce enrichies (Vague 1)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

alter table public.listings add column if not exists type_logement text;     -- Appartement / Maison / Studio
alter table public.listings add column if not exists nb_colocs_total integer; -- nb de colocataires au total
alter table public.listings add column if not exists caution integer;         -- dépôt de garantie (€)
alter table public.listings add column if not exists salle_de_bain text;      -- Privée / Partagée
alter table public.listings add column if not exists duree_min_bail text;     -- durée minimale demandée
alter table public.listings add column if not exists genre_colocs text;       -- Mixte / Entre filles / Entre garçons
