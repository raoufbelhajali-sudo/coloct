"use client";

import { KeyRound, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Petit pin indiquant le rôle (Annonceur / Colocataire). Affiché à côté du logo.
export default function RolePin() {
  const { profile } = useAuth();
  if (!profile) return null;
  const estLoca = profile.role === "locataire";
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 shadow-sm"
      style={{ backgroundImage: "linear-gradient(135deg, #4a4a4f, #232328)" }}
    >
      {estLoca ? (
        <KeyRound className="h-3 w-3 text-white/80" />
      ) : (
        <Search className="h-3 w-3 text-white/80" />
      )}
      {estLoca ? "Annonceur" : "Colocataire"}
    </span>
  );
}
