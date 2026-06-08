"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { toucherActivite } from "./activite";

export type Role = "locataire" | "colocataire";

// Profil tel que stocké dans la table "profiles"
export type Profile = {
  id: string;
  role: Role;
  prenom: string;
  pseudo: string | null;
  photo_url: string | null;
  age: number | null;
  genre: string | null; // Femme / Homme / Autre
  profession: string | null; // statut ou métier (ex. "Étudiante", "Designer")
  salaire: string | null; // tranche de salaire net/mois
  bio: string | null; // présentation
  interets: string[] | null; // centres d'intérêt
  ambiance: string[] | null; // Calme / Sociable / Fêtard·e (plusieurs possibles)
  rythme: string[] | null; // Matinal·e / Noctambule / Flexible (plusieurs possibles)
  budget_max: number | null;
  age_min: number | null;
  age_max: number | null;
  ville: string | null;
  departement: string | null;
  quartiers: string[] | null;
  date_emmenagement: string | null;
  duree_coloc: string | null; // durée de colocation souhaitée
  last_seen: string | null; // dernière activité (badge "actif récemment")
  hero_until: string | null; // forfait HeroSwiper actif jusqu'à
  langues: string[] | null; // langues parlées
  niveau_sonore: string | null; // calme / équilibré / fêtard
  genre_coloc_recherche: string | null; // préférence de mixité
  prompts: Record<string, string> | null; // réponses libres (questions de profil)
  non_fumeur: boolean;
  animaux: boolean;
  teletravail: boolean;
  parking_souhaite: boolean; // colocataire : souhaite une place de parking
  identite_verifiee: boolean; // pièce d'identité fournie → badge "vérifié"
  credits_messages: number; // crédits de messages directs (contacter sans match)
  premium_until: string | null; // Pass Express actif jusqu'à cette date
  boosted_until: string | null; // Boost actif jusqu'à cette date
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Va chercher le profil du compte connecté
  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile((data as Profile) ?? null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  useEffect(() => {
    // Au démarrage : récupère la session existante (si déjà connecté)
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) await loadProfile(u.id);
      setLoading(false);
    });

    // Réagit aux connexions / déconnexions
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await loadProfile(u.id);
      else setProfile(null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Marque l'utilisateur comme "actif récemment" à chaque ouverture
  useEffect(() => {
    if (user) toucherActivite(user.id).catch(() => {});
  }, [user?.id]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Petit raccourci pour utiliser l'état de connexion dans n'importe quelle page
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
