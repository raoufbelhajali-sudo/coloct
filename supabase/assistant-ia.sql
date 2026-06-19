-- ============================================================================
-- Assistant IA : améliore / rédige un texte (profil ou annonce) via Claude.
--
-- Prérequis (à faire UNE fois dans Supabase) :
--   1) Console Anthropic -> crée une clé API.
--   2) Dashboard Supabase -> Project Settings -> Vault -> New secret :
--        Name  = anthropic_api_key
--        Value = sk-ant-...   (ta clé)
--   3) Lance ce fichier dans le SQL Editor.
--
-- Appel depuis l'app :
--   supabase.rpc('assistant_ia', { contexte, action, contenu, infos })
-- ============================================================================

-- Extension HTTP synchrone (pour appeler l'API Anthropic et attendre la réponse)
create extension if not exists http with schema extensions;

-- Récupère la clé Anthropic depuis le Vault (jamais exposée au client)
create or replace function public.anthropic_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'anthropic_api_key'
  limit 1;
$$;
revoke all on function public.anthropic_key() from anon, authenticated;

-- Fonction principale appelée par l'app
--   contexte : 'profil' | 'annonce'
--   action   : 'ameliorer' | 'rediger'
--   contenu  : le texte actuel (ou des infos brutes pour 'rediger')
--   infos    : contexte additionnel optionnel (jsonb)
create or replace function public.assistant_ia(
  contexte text,
  action   text,
  contenu  text default '',
  infos    jsonb default '{}'::jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key    text;
  v_system text;
  v_prompt text;
  v_resp   extensions.http_response;
  v_text   text;
begin
  -- Sécurité : réservé aux utilisateurs connectés
  if auth.uid() is null then
    return null;
  end if;

  v_key := public.anthropic_key();
  if v_key is null then
    return 'Assistant IA non configuré (clé manquante).';
  end if;

  -- Consigne (system) selon le contexte
  if contexte = 'annonce' then
    v_system :=
      'Tu aides un annonceur d''une appli de colocation/location à rédiger une '
      || 'description courte, claire et attractive (3 à 5 phrases), en français, '
      || 'au ton chaleureux. N''invente PAS d''informations. N''écris JAMAIS '
      || 'd''adresse e-mail ni de numéro de téléphone. Réponds UNIQUEMENT avec le '
      || 'texte final, sans guillemets ni commentaire.';
  else
    v_system :=
      'Tu aides un utilisateur d''une appli de colocation à rédiger une '
      || 'présentation de profil chaleureuse, authentique et concise (3 à 5 '
      || 'phrases), en français, au tutoiement. N''invente pas de faits. N''écris '
      || 'JAMAIS d''adresse e-mail ni de numéro de téléphone. Réponds UNIQUEMENT '
      || 'avec le texte final, sans guillemets ni commentaire.';
  end if;

  -- Demande (user) selon l'action
  if action = 'rediger' then
    v_prompt := 'Rédige le texte à partir de ces éléments : '
                || coalesce(nullif(contenu, ''), '(aucun texte fourni)')
                || case when infos is not null and infos <> '{}'::jsonb
                        then ' | Infos : ' || infos::text else '' end;
  else
    v_prompt := 'Améliore ce texte (corrige les fautes, rends-le plus fluide et '
                || 'engageant, garde le sens et la longueur similaire) : '
                || coalesce(contenu, '');
  end if;

  -- Timeout généreux (la génération prend quelques secondes)
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');

  -- Appel à l'API Anthropic (Claude Haiku : rapide + économique)
  select * into v_resp from extensions.http((
    'POST',
    'https://api.anthropic.com/v1/messages',
    array[
      extensions.http_header('x-api-key', v_key),
      extensions.http_header('anthropic-version', '2023-06-01')
    ],
    'application/json',
    json_build_object(
      'model', 'claude-haiku-4-5-20251001',
      'max_tokens', 500,
      'system', v_system,
      'messages', json_build_array(
        json_build_object('role', 'user', 'content', v_prompt)
      )
    )::text
  )::extensions.http_request);

  if v_resp.status <> 200 then
    return 'Désolé, le service IA est momentanément indisponible.';
  end if;

  -- Réponse Anthropic : { "content": [ { "type":"text", "text":"..." } ] }
  v_text := (v_resp.content::jsonb) -> 'content' -> 0 ->> 'text';
  return coalesce(nullif(trim(v_text), ''), 'Désolé, je n''ai pas pu générer de suggestion.');
end;
$$;

grant execute on function public.assistant_ia(text, text, text, jsonb) to authenticated;
