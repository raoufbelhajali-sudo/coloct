"use client";

import { KeyRound, Telescope } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Petit pin indiquant le rôle (Annonceur / Colocataire). Affiché à côté du logo.
export default function RolePin() {
  const { profile } = useAuth();
  if (!profile) return null;
  const estLoca = profile.role === "locataire";
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink/70">
      {estLoca ? (
        <KeyRound className="h-3 w-3 text-violet" />
      ) : (
        <Telescope className="h-3 w-3 text-pink" />
      )}
      {estLoca ? "Annonceur" : "Colocataire"}
    </span>
  );
}
