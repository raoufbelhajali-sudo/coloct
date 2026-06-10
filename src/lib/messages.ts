import { supabase } from "./supabase";
import type { Role } from "./auth";
import { lieuComplet } from "./listings";
import { getIdsBloques } from "./blocks";

// Supprime une discussion (le match) — les messages sont supprimés en cascade
export async function supprimerMatch(matchId: number): Promise<void> {
  await supabase.from("matches").delete().eq("id", matchId);
}

// Résumé d'un match pour la liste "Mes matchs"
export type MatchSummary = {
  id: number;
  listingId: number;
  titre: string; // ex. "Bastille · Paris 11e"
  sousTitre: string; // ex. "820 € · avec Léa"
  photo: string | null;
  autrePrenom: string;
};

// Un message dans une conversation (texte et/ou document joint)
export type Message = {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  doc_path: string | null; // chemin du document joint (stockage privé)
  doc_name: string | null; // nom lisible du document
};

// Récupère tous les matchs du compte connecté (quel que soit son rôle)
export async function getMyMatches(
  userId: string
): Promise<MatchSummary[]> {
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("id, listing_id, colocataire_id, locataire_id, created_at")
    .or(`colocataire_id.eq.${userId},locataire_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (!matchesRaw || matchesRaw.length === 0) return [];

  // On masque les discussions avec des personnes bloquées
  const bloques = await getIdsBloques(userId);
  const matches = matchesRaw.filter((m) => {
    const autre =
      m.colocataire_id === userId ? m.locataire_id : m.colocataire_id;
    return !bloques.has(autre);
  });
  if (matches.length === 0) return [];

  // On récupère les annonces concernées
  const listingIds = [...new Set(matches.map((m) => m.listing_id))];
  const { data: listings } = await supabase
    .from("listings")
    .select("id, titre, quartier, ville, departement, arrondissement, loyer, photos")
    .in("id", listingIds);
  const listingById = new Map((listings ?? []).map((l) => [l.id, l]));

  // On récupère le prénom de "l'autre personne" de chaque match
  const otherIds = [
    ...new Set(
      matches.map((m) =>
        m.colocataire_id === userId ? m.locataire_id : m.colocataire_id
      )
    ),
  ];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, prenom, photo_url")
    .in("id", otherIds);
  const prenomById = new Map((profiles ?? []).map((p) => [p.id, p.prenom]));
  const photoById = new Map(
    (profiles ?? []).map((p) => [p.id, p.photo_url as string | null])
  );

  return matches.map((m) => {
    const l = listingById.get(m.listing_id);
    const otherId =
      m.colocataire_id === userId ? m.locataire_id : m.colocataire_id;
    const autrePrenom = prenomById.get(otherId) ?? "Quelqu'un";
    // L'annonceur (locataire) voit le COLOCATAIRE (nom + photo).
    // Le colocataire voit l'ANNONCE (titre + photo du logement).
    const estAnnonceur = m.colocataire_id !== userId;
    return {
      id: m.id,
      listingId: m.listing_id,
      titre: estAnnonceur
        ? autrePrenom
        : l
          ? l.titre || lieuComplet(l)
          : "Colocation",
      sousTitre: estAnnonceur
        ? l
          ? `Intéressé·e par : ${l.titre || lieuComplet(l)}`
          : "Intéressé·e par ta chambre"
        : l
          ? `${l.loyer} € · avec ${autrePrenom}`
          : `avec ${autrePrenom}`,
      photo: estAnnonceur
        ? photoById.get(otherId) ?? l?.photos?.[0] ?? null
        : l?.photos?.[0] ?? null,
      autrePrenom,
    };
  });
}

// Activité d'un match pour les notifications (date du match + dernier message reçu)
export type MatchActivite = {
  matchId: number;
  createdAt: string;
  dernierAutreMsg: string | null; // date du dernier message reçu de l'autre
  dernierAutreType: string | null; // type du dernier message reçu (doc_name)
};

// Récupère, pour chaque match du compte, sa date et la date du dernier message
// envoyé par l'AUTRE personne (sert à calculer les notifications non lues).
export async function getMatchesActivite(
  userId: string
): Promise<MatchActivite[]> {
  const { data: matches } = await supabase
    .from("matches")
    .select("id, created_at, colocataire_id, locataire_id")
    .or(`colocataire_id.eq.${userId},locataire_id.eq.${userId}`);
  if (!matches || matches.length === 0) return [];

  const ids = matches.map((m) => m.id);
  const { data: msgs } = await supabase
    .from("messages")
    .select("match_id, sender_id, created_at, doc_name")
    .in("match_id", ids)
    .order("created_at", { ascending: false });

  // Dernier message reçu (envoyé par quelqu'un d'autre) par match : date + type
  const dernierAutre = new Map<number, string>();
  const dernierType = new Map<number, string | null>();
  for (const m of msgs ?? []) {
    if (m.sender_id !== userId && !dernierAutre.has(m.match_id)) {
      dernierAutre.set(m.match_id, m.created_at);
      dernierType.set(m.match_id, m.doc_name ?? null);
    }
  }

  return matches.map((m) => ({
    matchId: m.id,
    createdAt: m.created_at,
    dernierAutreMsg: dernierAutre.get(m.id) ?? null,
    dernierAutreType: dernierType.get(m.id) ?? null,
  }));
}

// Les messages d'un match, du plus ancien au plus récent
export async function getMessages(matchId: number): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  return (data as Message[]) ?? [];
}

// Envoie un message dans un match
export async function sendMessage(
  matchId: number,
  senderId: string,
  content: string
): Promise<void> {
  await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: senderId, content });
}

// Marqueurs des messages de visite
export const MARQUEUR_VISITE = "Visite proposée";
export const MARQUEUR_VISITE_OK = "Visite acceptée";

// L'annonceur propose une visite (date/heure ISO + lieu)
export async function proposerVisite(
  matchId: number,
  senderId: string,
  iso: string,
  lieu: string
): Promise<void> {
  await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    content: `${iso}|${lieu}`,
    doc_name: MARQUEUR_VISITE,
  });
}

// Le colocataire accepte le rendez-vous proposé
export async function accepterVisite(
  matchId: number,
  senderId: string,
  iso: string,
  lieu: string
): Promise<void> {
  await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    content: `${iso}|${lieu}`,
    doc_name: MARQUEUR_VISITE_OK,
  });
}

// Types de documents proposés dans la checklist
export const TYPES_DOCUMENTS = [
  "Pièce d'identité",
  "Fiche de paie",
  "Contrat de travail",
  "Garant",
  "Avis d'imposition",
  "Justificatif de domicile",
];

// Infos d'un match utiles à la conversation (rôles + documents demandés)
export async function getMatchInfo(matchId: number): Promise<{
  colocataire_id: string;
  locataire_id: string;
  documents_requis: string[];
} | null> {
  const { data } = await supabase
    .from("matches")
    .select("colocataire_id, locataire_id, documents_requis")
    .eq("id", matchId)
    .maybeSingle();
  if (!data) return null;
  return {
    colocataire_id: data.colocataire_id,
    locataire_id: data.locataire_id,
    documents_requis: data.documents_requis ?? [],
  };
}

// --- Accusés de lecture ---
// Dates de dernière lecture de chaque membre du match
export async function getLecture(matchId: number): Promise<{
  colocataire: string | null;
  locataire: string | null;
}> {
  const { data } = await supabase
    .from("matches")
    .select("lu_colocataire_at, lu_locataire_at")
    .eq("id", matchId)
    .maybeSingle();
  return {
    colocataire: data?.lu_colocataire_at ?? null,
    locataire: data?.lu_locataire_at ?? null,
  };
}

// Marque la conversation comme lue par le membre courant (selon son rôle)
export async function marquerLu(
  matchId: number,
  estLocataire: boolean
): Promise<void> {
  const champ = estLocataire ? "lu_locataire_at" : "lu_colocataire_at";
  await supabase
    .from("matches")
    .update({ [champ]: new Date().toISOString() })
    .eq("id", matchId);
}

// Le locataire met à jour la liste des documents demandés
export async function setDocumentsRequis(
  matchId: number,
  liste: string[]
): Promise<void> {
  await supabase
    .from("matches")
    .update({ documents_requis: liste })
    .eq("id", matchId);
}

// Envoie un document dans un match (stockage privé + message avec pièce jointe).
// `label` = type de document (pour la checklist) ; sinon le nom du fichier.
export async function sendDocument(
  matchId: number,
  senderId: string,
  file: File,
  label?: string
): Promise<{ error?: string }> {
  const chemin = `${matchId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("documents")
    .upload(chemin, file);
  if (error) return { error: error.message };
  await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    content: "",
    doc_path: chemin,
    doc_name: label || file.name,
  });
  return {};
}

// Envoie un message vocal dans un match (audio enregistré, stockage privé)
export async function sendVoice(
  matchId: number,
  senderId: string,
  blob: Blob
): Promise<{ error?: string }> {
  const ext = blob.type.includes("mp4") ? "m4a" : "webm";
  const chemin = `${matchId}/voice-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("documents")
    .upload(chemin, blob, { contentType: blob.type || "audio/webm" });
  if (error) return { error: error.message };
  await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    content: "",
    doc_path: chemin,
    doc_name: "Message vocal",
  });
  return {};
}

// Génère un lien temporaire (1h) pour télécharger un document privé
export async function getDocUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
