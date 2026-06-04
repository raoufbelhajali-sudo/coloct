-- Colock't — Suppression de compte par l'utilisateur lui-même
-- À coller dans Supabase : SQL Editor → New query → coller → Run
-- Crée une fonction sécurisée qui supprime le compte connecté.
-- Grâce aux clés étrangères "on delete cascade", profil, annonces, swipes,
-- matchs et messages sont supprimés automatiquement.

create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
