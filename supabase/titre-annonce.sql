-- Titre / nom de l'annonce (visible par le colocataire dans la conversation + "Qui t'a aimé")
alter table public.listings add column if not exists titre text;
