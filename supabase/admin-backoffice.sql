-- ============================================================
--  Back-office FlatSwiper — droits d'administration (script complet)
--  Idempotent : tu peux le relancer sans risque.
--  À coller dans Supabase → SQL Editor → Run
-- ============================================================

-- 1) Colonnes admin / suspension / mot de passe back-office sur les profils
alter table profiles add column if not exists is_admin boolean default false;
alter table profiles add column if not exists suspendu boolean default false;
alter table profiles add column if not exists bo_hash text;

-- 2) Te désigner admin (⚠️ email de TON compte FlatSwiper)
update profiles
  set is_admin = true
  where id = (select id from auth.users where email = 'raoufbelhajali@gmail.com');

-- 3) Fonction : l'utilisateur connecté est-il admin ?
create or replace function public.est_admin()
  returns boolean language sql security definer stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 4) Droits admin (voir / gérer) sur toutes les tables utiles
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','listings','matches','reports','reviews'
  ] loop
    execute format('drop policy if exists "admin gere %1$s" on %1$s', t);
    execute format(
      'create policy "admin gere %1$s" on %1$s for all using (public.est_admin()) with check (public.est_admin())',
      t
    );
  end loop;
end $$;

-- 5) Storage : un admin peut lire les pièces d'identité
drop policy if exists "admin lit identites" on storage.objects;
create policy "admin lit identites" on storage.objects
  for select using (bucket_id = 'identites' and public.est_admin());
