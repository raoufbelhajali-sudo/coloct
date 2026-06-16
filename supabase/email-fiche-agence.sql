-- ============================================================
-- Email "fiche colocataire" aux ENTREPRISES / AGENCES.
-- Quand un colocataire met un J'AIME sur l'annonce d'une agence,
-- celle-ci reçoit par email une fiche récap du colocataire (PC-friendly).
--
-- ⚠️ Prérequis : avoir déjà lancé `emails-notifications.sql`
--    (fournit envoyer_email(), veut_emails(), le coffre resend_api_key).
-- À coller dans Supabase → SQL Editor → New query → Run.
-- ============================================================

create or replace function public.notif_like_agence()
returns trigger language plpgsql security definer
set search_path = public, auth, extensions
as $$
declare
  v_owner uuid;
  v_email text;
  v_agence boolean;
  v_titre text;
  c record;
  v_html text;
begin
  -- Uniquement : un COLOCATAIRE qui LIKE une annonce (pas un pass, pas un swipe de profil)
  if NEW.direction <> 'like' or NEW.listing_id is null or NEW.target_user_id is not null then
    return NEW;
  end if;

  -- L'annonce appartient-elle à une agence / entreprise ?
  select owner_id into v_owner from public.listings where id = NEW.listing_id;
  if v_owner is null then return NEW; end if;
  select est_agence into v_agence from public.profiles where id = v_owner;
  if not coalesce(v_agence, false) then return NEW; end if;

  -- L'agence veut-elle des emails ? + a-t-elle une adresse ?
  if not public.veut_emails(v_owner) then return NEW; end if;
  select email into v_email from auth.users where id = v_owner;
  if v_email is null or v_email = '' then return NEW; end if;

  -- Fiche du colocataire (le swiper) + titre de l'annonce concernée
  select prenom, pseudo, age, ville, profession, salaire, bio
    into c from public.profiles where id = NEW.swiper_id;
  select coalesce(nullif(titre, ''), ville) into v_titre
    from public.listings where id = NEW.listing_id;

  v_html :=
    '<div style="font-family:Arial,sans-serif;color:#111827;max-width:560px;margin:auto">'
    || '<h2 style="color:#2563eb">Un colocataire a aimé votre annonce</h2>'
    || '<p>Annonce concernée : <strong>' || coalesce(v_titre, '') || '</strong></p>'
    || '<table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px">'
    || '<tr><td style="color:#6b7280">Pseudo</td><td><strong>'
        || coalesce(nullif(c.pseudo, ''), c.prenom, '—') || '</strong></td></tr>'
    || '<tr><td style="color:#6b7280">Âge</td><td>' || coalesce(c.age::text, '—') || '</td></tr>'
    || '<tr><td style="color:#6b7280">Ville recherchée</td><td>' || coalesce(c.ville, '—') || '</td></tr>'
    || '<tr><td style="color:#6b7280">Situation pro</td><td>' || coalesce(c.profession, '—') || '</td></tr>'
    || '<tr><td style="color:#6b7280">Tranche de salaire</td><td>' || coalesce(c.salaire, '—') || '</td></tr>'
    || '</table>'
    || '<p style="margin-top:12px"><strong>Présentation :</strong><br>'
        || coalesce(nullif(c.bio, ''), '—') || '</p>'
    || '<p style="margin-top:16px"><a href="https://flatswiper.com/notifs" '
        || 'style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">'
        || 'Voir dans FlatSwiper</a></p>'
    || '</div>';

  perform public.envoyer_email(
    v_email,
    'Un colocataire a aimé votre annonce — FlatSwiper',
    v_html
  );
  return NEW;
end; $$;

drop trigger if exists trig_notif_like_agence on public.swipes;
create trigger trig_notif_like_agence
  after insert on public.swipes
  for each row execute function public.notif_like_agence();
