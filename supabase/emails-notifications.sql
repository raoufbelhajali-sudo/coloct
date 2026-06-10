-- ============================================================
-- Emails de relance "nouveau match" / "nouveau message" via Resend
-- Nécessite : extension pg_net activée + le secret 'resend_api_key' dans le Vault.
-- (voir les étapes données dans le chat avant de lancer ce fichier)
-- ============================================================

create extension if not exists pg_net;

-- Mémorise la dernière relance email par membre (anti-spam des messages)
alter table public.matches
  add column if not exists notif_email_coloc_at timestamptz,
  add column if not exists notif_email_loca_at timestamptz;

-- Lit la clé API Resend depuis le Vault Supabase (jamais en clair dans le code)
create or replace function public.resend_key()
returns text language sql security definer stable as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = 'resend_api_key' limit 1;
$$;

-- Gabarit HTML d'email (logo + titre + texte + bouton corail)
create or replace function public.email_html(
  prenom text, titre text, message text, bouton text, lien text
) returns text language sql immutable as $$
  select format($html$
<!doctype html><html lang="fr"><body style="margin:0;background:#fff1ea;font-family:Helvetica,Arial,sans-serif;color:#2b211a;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff1ea;padding:24px 12px;"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(250,82,82,0.12);">
<tr><td style="background:#ffffff;padding:34px 24px 6px;text-align:center;border-bottom:1px solid #f0e6df;">
<img src="https://flatswiper.com/logo-email.png" width="210" alt="Flatswiper" style="max-width:210px;height:auto;border:0;display:inline-block;">
</td></tr>
<tr><td style="padding:32px 28px;text-align:center;">
<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#2b211a;">%s</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5b5048;">Salut %s, %s</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td align="center" style="border-radius:999px;background:#fa5252;background-image:linear-gradient(135deg,#fa5252,#fd7e14);">
<a href="%s" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">%s</a>
</td></tr></table></td></tr>
<tr><td style="padding:20px 28px 28px;border-top:1px solid #f0e6df;">
<p style="margin:0;font-size:12px;color:#9a8f86;">FlatSwiper — trouve ta colocation partout en France · <a href="https://flatswiper.com" style="color:#9a8f86;">flatswiper.com</a></p>
</td></tr></table></td></tr></table></body></html>
  $html$, titre, prenom, message, lien, bouton);
$$;

-- Envoie un email via Resend (asynchrone, ne bloque pas l'insertion)
create or replace function public.envoyer_email(destinataire text, sujet text, html text)
returns void language plpgsql security definer as $$
begin
  if destinataire is null or destinataire = '' then return; end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || public.resend_key(),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'FlatSwiper <bonjour@flatswiper.com>',
      'to', destinataire,
      'subject', sujet,
      'html', html
    )
  );
end; $$;

-- L'utilisateur a-t-il accepté les emails ? (toggle des réglages, défaut = oui)
create or replace function public.veut_emails(uid uuid)
returns boolean language sql security definer stable as $$
  select coalesce((raw_user_meta_data->>'notif_email') is distinct from 'false', true)
  from auth.users where id = uid;
$$;

-- ============ Déclencheur : NOUVEAU MATCH (prévient les 2 membres) ============
create or replace function public.notif_match()
returns trigger language plpgsql security definer as $$
declare
  e text; pr text; ids uuid[]; uid uuid;
begin
  ids := array[NEW.colocataire_id, NEW.locataire_id];
  foreach uid in array ids loop
    if public.veut_emails(uid) then
      select email into e from auth.users where id = uid;
      select prenom into pr from public.profiles where id = uid;
      perform public.envoyer_email(
        e, 'Nouveau match sur FlatSwiper 🎉',
        public.email_html(
          coalesce(pr, 'toi'),
          'C''est un match ! 🎉',
          'tu as un nouveau match sur FlatSwiper. Connecte-toi pour discuter et organiser une visite.',
          'Voir mon match', 'https://flatswiper.com/matchs/'
        )
      );
    end if;
  end loop;
  return NEW;
end; $$;

drop trigger if exists trig_notif_match on public.matches;
create trigger trig_notif_match after insert on public.matches
  for each row execute function public.notif_match();

-- ============ Déclencheur : NOUVEAU MESSAGE (au destinataire, anti-spam 15 min) ============
create or replace function public.notif_message()
returns trigger language plpgsql security definer as $$
declare
  m record; dest uuid; est_coloc boolean; derniere timestamptz;
  e text; pr text; pr_exp text;
begin
  select * into m from public.matches where id = NEW.match_id;
  if m is null then return NEW; end if;

  if NEW.sender_id = m.colocataire_id then
    dest := m.locataire_id; est_coloc := false; derniere := m.notif_email_loca_at;
  else
    dest := m.colocataire_id; est_coloc := true; derniere := m.notif_email_coloc_at;
  end if;

  -- anti-spam : pas plus d'1 email / 15 min / personne / conversation
  if derniere is not null and derniere > now() - interval '15 minutes' then
    return NEW;
  end if;
  if not public.veut_emails(dest) then return NEW; end if;

  select email into e from auth.users where id = dest;
  select prenom into pr from public.profiles where id = dest;
  select prenom into pr_exp from public.profiles where id = NEW.sender_id;

  perform public.envoyer_email(
    e, 'Nouveau message sur FlatSwiper 💬',
    public.email_html(
      coalesce(pr, 'toi'),
      'Tu as un nouveau message 💬',
      coalesce(pr_exp, 'Quelqu''un') || ' t''a écrit sur FlatSwiper. Connecte-toi pour répondre.',
      'Lire le message', 'https://flatswiper.com/matchs/'
    )
  );

  if est_coloc then
    update public.matches set notif_email_coloc_at = now() where id = m.id;
  else
    update public.matches set notif_email_loca_at = now() where id = m.id;
  end if;
  return NEW;
end; $$;

drop trigger if exists trig_notif_message on public.messages;
create trigger trig_notif_message after insert on public.messages
  for each row execute function public.notif_message();
