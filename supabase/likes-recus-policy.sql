-- Colock't — "Qui vous aime" : autoriser à voir les j'aime REÇUS
-- À coller dans Supabase : SQL Editor → New query → coller → Run
-- (Politique supplémentaire : elle s'AJOUTE à "Voir ses swipes", ne remplace rien.)

drop policy if exists "Voir les likes recus" on public.swipes;
create policy "Voir les likes recus"
  on public.swipes for select
  using (
    direction = 'like' and (
      -- un locataire m'a liké (je suis la cible)
      auth.uid() = target_user_id
      -- ou un colocataire a liké MON annonce
      or (
        target_user_id is null
        and listing_id in (
          select id from public.listings where owner_id = auth.uid()
        )
      )
    )
  );
