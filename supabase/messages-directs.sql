-- Colock't — Messages directs (contacter un annonceur sans match)
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) Crédits de messages directs sur le profil
alter table public.profiles
  add column if not exists credits_messages integer not null default 0;

-- 2) Fonction sécurisée : crée (ou réutilise) la conversation avec l'annonceur
--    d'une annonce, sans exiger de match réciproque. Renvoie l'id du match.
create or replace function public.creer_message_direct(p_listing bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_match bigint;
begin
  select owner_id into v_owner from public.listings where id = p_listing;
  if v_owner is null then
    raise exception 'Annonce sans annonceur';
  end if;
  if v_owner = auth.uid() then
    raise exception 'Impossible de se contacter soi-même';
  end if;

  insert into public.matches (colocataire_id, locataire_id, listing_id)
  values (auth.uid(), v_owner, p_listing)
  on conflict (colocataire_id, listing_id) do nothing;

  select id into v_match
  from public.matches
  where colocataire_id = auth.uid() and listing_id = p_listing;

  return v_match;
end;
$$;

revoke all on function public.creer_message_direct(bigint) from public, anon;
grant execute on function public.creer_message_direct(bigint) to authenticated;
