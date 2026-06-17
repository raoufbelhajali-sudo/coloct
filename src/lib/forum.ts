import { supabase } from "./supabase";

export type Sujet = {
  id: number;
  titre: string;
  contenu: string;
  categorie: string;
  created_at: string;
  auteurId: string | null;
  auteur: string;
  nbReponses: number;
};

export type Reponse = {
  id: number;
  contenu: string;
  created_at: string;
  auteurId: string | null;
  auteur: string;
};

export const CATEGORIES_FORUM = [
  "Trouver une colocation",
  "Trouver une location",
  "Vie en colocation",
  "Vie en location",
  "Bail & démarches",
  "Budget & charges",
  "Général",
];

// Prénoms par id (auteurs). null → "Équipe FlatSwiper".
async function nomsParId(ids: string[]): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  const uniques = [...new Set(ids)];
  if (uniques.length === 0) return m;
  const { data } = await supabase
    .from("profiles")
    .select("id, prenom")
    .in("id", uniques);
  (data ?? []).forEach((p: Record<string, unknown>) => {
    m.set(p.id as string, (p.prenom as string) || "Membre");
  });
  return m;
}

function nomAuteur(id: string | null, noms: Map<string, string>): string {
  if (!id) return "Équipe FlatSwiper";
  return noms.get(id) ?? "Membre";
}

export async function getSujets(): Promise<Sujet[]> {
  const { data } = await supabase
    .from("forum_sujets")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data as Record<string, unknown>[]) ?? [];

  // Compte des réponses par sujet
  const { data: rep } = await supabase.from("forum_reponses").select("sujet_id");
  const counts = new Map<number, number>();
  ((rep as Record<string, unknown>[]) ?? []).forEach((r) => {
    const sid = r.sujet_id as number;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  });

  const noms = await nomsParId(
    rows.map((r) => r.auteur_id as string).filter(Boolean)
  );
  return rows.map((r) => ({
    id: r.id as number,
    titre: r.titre as string,
    contenu: r.contenu as string,
    categorie: r.categorie as string,
    created_at: r.created_at as string,
    auteurId: (r.auteur_id as string) ?? null,
    auteur: nomAuteur((r.auteur_id as string) ?? null, noms),
    nbReponses: counts.get(r.id as number) ?? 0,
  }));
}

export async function getSujet(id: string): Promise<Sujet | null> {
  const { data } = await supabase
    .from("forum_sujets")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) return null;
  const r = data as Record<string, unknown>;
  const noms = await nomsParId([r.auteur_id as string].filter(Boolean));
  return {
    id: r.id as number,
    titre: r.titre as string,
    contenu: r.contenu as string,
    categorie: r.categorie as string,
    created_at: r.created_at as string,
    auteurId: (r.auteur_id as string) ?? null,
    auteur: nomAuteur((r.auteur_id as string) ?? null, noms),
    nbReponses: 0,
  };
}

export async function getReponses(sujetId: string): Promise<Reponse[]> {
  const { data } = await supabase
    .from("forum_reponses")
    .select("*")
    .eq("sujet_id", Number(sujetId))
    .order("created_at", { ascending: true });
  const rows = (data as Record<string, unknown>[]) ?? [];
  const noms = await nomsParId(
    rows.map((r) => r.auteur_id as string).filter(Boolean)
  );
  return rows.map((r) => ({
    id: r.id as number,
    contenu: r.contenu as string,
    created_at: r.created_at as string,
    auteurId: (r.auteur_id as string) ?? null,
    auteur: nomAuteur((r.auteur_id as string) ?? null, noms),
  }));
}

// Crée un sujet. Renvoie l'id, ou null si échec (ex. non connecté → RLS).
export async function creerSujet(
  auteurId: string,
  titre: string,
  contenu: string,
  categorie: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("forum_sujets")
    .insert({ auteur_id: auteurId, titre, contenu, categorie })
    .select("id")
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: number }).id;
}

export async function repondre(
  auteurId: string,
  sujetId: number,
  contenu: string
): Promise<boolean> {
  const { error } = await supabase
    .from("forum_reponses")
    .insert({ auteur_id: auteurId, sujet_id: sujetId, contenu });
  return !error;
}
