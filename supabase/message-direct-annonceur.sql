-- Message direct ANNONCEUR → colocataire (sans attendre un match réciproque).
-- L'annonceur (propriétaire de l'annonce) ouvre une conversation avec un
-- colocataire qu'il a repéré. Réservé aux annonceurs avec le forfait (premium).

create or replace function public.creer_message_direct_annonceur(
  p_colocataire uuid,
  p_listing bigint
)
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
    raise exception 'Annonce introuvable';
  end if;
  -- Sécurité : seul le propriétaire de l'annonce peut écrire en son nom
  if v_owner <> auth.uid() then
    raise exception 'Cette annonce ne t''appartient pas';
  end if;
  if p_colocataire = auth.uid() then
    raise exception 'Impossible de se contacter soi-même';
  end if;

  insert into public.matches (colocataire_id, locataire_id, listing_id)
  values (p_colocataire, auth.uid(), p_listing)
  on conflict (colocataire_id, listing_id) do nothing;

  select id into v_match
  from public.matches
  where colocataire_id = p_colocataire and listing_id = p_listing;

  return v_match;
end;
$$;

revoke all on function public.creer_message_direct_annonceur(uuid, bigint) from public, anon;
grant execute on function public.creer_message_direct_annonceur(uuid, bigint) to authenticated;
