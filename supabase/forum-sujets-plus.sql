-- ============================================================
--  10 sujets de discussion en plus pour le Blog & Entraide.
--  Idempotent : ne réinsère pas un sujet déjà présent (par titre).
--  À coller dans Supabase → SQL Editor → Run.
--  (Lance forum.sql AVANT si ce n'est pas déjà fait.)
-- ============================================================

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Animal de compagnie en colocation : c''est possible ?',
  'J''ai un chat et je cherche une coloc. Comment aborder le sujet avec les colocataires et le propriétaire ? Vos retours sur la coloc avec un animal ?',
  'Vie en colocation'
where not exists (select 1 from public.forum_sujets where titre = 'Animal de compagnie en colocation : c''est possible ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Faut-il forcément un garant pour une colocation ?',
  'Je n''ai pas de garant sous la main. Est-ce rédhibitoire ? Quelles alternatives (Visale, garantie bancaire, caution solidaire) avez-vous utilisées ?',
  'Bail & démarches'
where not exists (select 1 from public.forum_sujets where titre = 'Faut-il forcément un garant pour une colocation ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Coloc meublée ou vide : que choisir ?',
  'Avantages et inconvénients d''une coloc déjà meublée vs un logement vide à équiper ? Côté budget et flexibilité, qu''est-ce qui est le mieux selon vous ?',
  'Trouver une coloc'
where not exists (select 1 from public.forum_sujets where titre = 'Coloc meublée ou vide : que choisir ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Comment gérer le ménage sans se prendre la tête ?',
  'Planning tournant, appli partagée, femme de ménage à plusieurs… Comment vous organisez-vous pour que le ménage reste équitable et sans tensions ?',
  'Vie en colocation'
where not exists (select 1 from public.forum_sujets where titre = 'Comment gérer le ménage sans se prendre la tête ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Bail individuel ou bail commun : quelle différence ?',
  'On me propose un bail commun avec clause de solidarité. Quels sont les risques par rapport à un bail individuel ? Que recommandez-vous ?',
  'Bail & démarches'
where not exists (select 1 from public.forum_sujets where titre = 'Bail individuel ou bail commun : quelle différence ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Quel budget réel prévoir pour une coloc à Paris ?',
  'Au-delà du loyer affiché, combien faut-il vraiment compter (charges, internet, courses communes, dépôt de garantie) pour vivre en coloc à Paris ?',
  'Budget & charges'
where not exists (select 1 from public.forum_sujets where titre = 'Quel budget réel prévoir pour une coloc à Paris ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Coloc étudiante ou jeunes actifs : laquelle me correspond ?',
  'Je commence à travailler après mes études. Vaut-il mieux rester en coloc étudiante ou viser une coloc de jeunes actifs ? Ambiance, rythme, budget ?',
  'Trouver une coloc'
where not exists (select 1 from public.forum_sujets where titre = 'Coloc étudiante ou jeunes actifs : laquelle me correspond ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Assurance habitation en colocation : comment ça marche ?',
  'Chacun sa propre assurance ou une assurance commune pour le logement ? Comment vous êtes-vous organisés pour être bien couverts sans payer en double ?',
  'Bail & démarches'
where not exists (select 1 from public.forum_sujets where titre = 'Assurance habitation en colocation : comment ça marche ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Vos conseils pour bien démarrer dans une nouvelle coloc ?',
  'J''emménage la semaine prochaine. Comment créer une bonne dynamique dès le début (repas d''accueil, règles communes, petites attentions) ?',
  'Vie en colocation'
where not exists (select 1 from public.forum_sujets where titre = 'Vos conseils pour bien démarrer dans une nouvelle coloc ?');

insert into public.forum_sujets (auteur_id, titre, contenu, categorie)
select null, 'Récupérer sa caution en quittant une coloc',
  'Je quitte ma coloc. Comment ça se passe pour récupérer mon dépôt de garantie quand on part avant les autres colocataires ? Vos expériences ?',
  'Bail & démarches'
where not exists (select 1 from public.forum_sujets where titre = 'Récupérer sa caution en quittant une coloc');
