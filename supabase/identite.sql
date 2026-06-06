-- Colock't — Vérification d'identité (badge "Identité vérifiée")
-- À coller dans Supabase : SQL Editor → New query → coller → Run

-- 1) Drapeau sur le profil
alter table public.profiles
  add column if not exists identite_verifiee boolean not null default false;

-- 2) Bucket privé pour les pièces d'identité
insert into storage.buckets (id, name, public)
values ('identites', 'identites', false)
on conflict (id) do nothing;

-- 3) Chacun ne peut déposer/lire QUE ses propres documents (dossier = son id)
drop policy if exists "Identite depot" on storage.objects;
create policy "Identite depot" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'identites'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Identite lecture" on storage.objects;
create policy "Identite lecture" on storage.objects for select to authenticated
  using (
    bucket_id = 'identites'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
