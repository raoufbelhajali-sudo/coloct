-- ============================================================
-- Email de BIENVENUE à l'inscription — notamment pour Google.
-- L'inscription par e-mail envoie déjà un mail de confirmation/bienvenue
-- (gabarit d'auth Supabase), donc on n'envoie CE mail que pour les
-- inscriptions externes (Google, etc.), afin d'éviter le doublon.
--
-- ⚠️ Prérequis : avoir DÉJÀ lancé `emails-notifications.sql`
--    (il fournit email_html(), envoyer_email(), veut_emails(), le Vault resend_api_key).
-- À coller dans Supabase → SQL Editor → New query → Run.
-- ============================================================

create or replace function public.notif_bienvenue()
returns trigger language plpgsql security definer
set search_path = public, auth, extensions
as $$
declare
  provider text;
  pr text;
begin
  -- Méthode d'inscription : 'email', 'google', ...
  provider := coalesce(NEW.raw_app_meta_data->>'provider', '');

  -- L'inscription par e-mail a déjà son propre mail → on ne double pas.
  if provider = 'email' then
    return NEW;
  end if;

  if NEW.email is null or NEW.email = '' then
    return NEW;
  end if;

  -- Respecte le choix "ne pas recevoir d'emails" si déjà positionné.
  if not public.veut_emails(NEW.id) then
    return NEW;
  end if;

  -- Prénom : premier mot du nom Google si dispo, sinon "toi".
  pr := nullif(split_part(coalesce(
          NEW.raw_user_meta_data->>'given_name',
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          ''), ' ', 1), '');
  pr := coalesce(pr, 'toi');

  perform public.envoyer_email(
    NEW.email,
    'Bienvenue sur FlatSwiper 🎉',
    public.email_html(
      pr,
      'Bienvenue sur FlatSwiper ! 🎉',
      'ton compte est créé. Complète ton profil pour commencer à swiper et trouver ta colocation idéale.',
      'Compléter mon profil', 'https://flatswiper.com/'
    )
  );
  return NEW;
end; $$;

drop trigger if exists trig_notif_bienvenue on auth.users;
create trigger trig_notif_bienvenue
  after insert on auth.users
  for each row execute function public.notif_bienvenue();
