import { createClient } from "@supabase/supabase-js";

// Connecteur vers Supabase (notre serveur : base de données + comptes).
// Les identifiants viennent du fichier .env.local (jamais sur Git).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
