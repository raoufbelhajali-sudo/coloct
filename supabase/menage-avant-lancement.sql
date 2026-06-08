-- ============================================================
--  MÉNAGE AVANT LANCEMENT — FlatSwiper
--  À exécuter dans Supabase → SQL Editor (https://supabase.com/dashboard/project/hmhtgcljqtfdsfiicuha/sql/new)
-- ============================================================

-- --------- PARTIE A : supprimer les 40 fausses annonces (seed) ----------
-- (Ne touche PAS aux annonces créées par de vrais comptes : owner_id non nul)
delete from public.listings
where owner_id is null;

-- Vérification (doit afficher uniquement de vraies annonces, ou 0) :
-- select count(*) as annonces_restantes from public.listings;


-- --------- PARTIE B : remettre les comptes à ZÉRO (À FAIRE LE JOUR DU LANCEMENT) ----------
-- ⚠️ DÉCOMMENTE et exécute SEULEMENT quand tu es prêt à ouvrir au public.
-- Ça supprime TOUS les comptes de test + leurs profils/annonces/swipes/matchs/messages (en cascade).
-- Tu devras recréer un compte ensuite pour te reconnecter.
--
-- delete from auth.users;
