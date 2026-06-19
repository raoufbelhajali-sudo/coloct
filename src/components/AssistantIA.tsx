"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Wand2, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Bouton + modale d'assistant IA : améliore ou rédige un texte (profil ou
// annonce) via la fonction SQL `assistant_ia` (qui appelle Claude). Le résultat
// est proposé à l'utilisateur, qui peut l'appliquer.
export default function AssistantIA({
  contexte,
  contenu,
  infos,
  onApply,
  className = "",
}: {
  contexte: "profil" | "annonce";
  contenu: string;
  infos?: Record<string, unknown>;
  onApply: (texte: string) => void;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => setMounted(true), []);

  async function lancer(action: "ameliorer" | "rediger") {
    setChargement(true);
    setErreur(false);
    setSuggestion(null);
    try {
      const { data, error } = await supabase.rpc("assistant_ia", {
        contexte,
        action,
        contenu: contenu ?? "",
        infos: infos ?? {},
      });
      if (error || !data) setErreur(true);
      else setSuggestion(String(data));
    } catch {
      setErreur(true);
    } finally {
      setChargement(false);
    }
  }

  const aDuTexte = !!(contenu && contenu.trim().length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSuggestion(null);
          setErreur(false);
        }}
        className={
          "inline-flex items-center gap-1.5 rounded-full bg-pink/10 px-3 py-1.5 text-xs font-semibold text-pink transition-colors hover:bg-pink/15 " +
          className
        }
      >
        <Sparkles className="h-3.5 w-3.5" /> Aide IA
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-panel p-5 sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Sparkles className="h-5 w-5 text-pink" /> Assistant IA
                </p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-panel-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-4 text-sm text-ink/65">
                {contexte === "annonce"
                  ? "Je peux améliorer ta description d'annonce ou la rédiger pour toi."
                  : "Je peux améliorer ta présentation ou la rédiger pour toi."}
              </p>

              {/* Actions */}
              {!chargement && suggestion === null && (
                <div className="flex flex-col gap-2">
                  {aDuTexte && (
                    <button
                      onClick={() => lancer("ameliorer")}
                      className="bg-metal flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white"
                    >
                      <Wand2 className="h-4 w-4" /> Améliorer mon texte
                    </button>
                  )}
                  <button
                    onClick={() => lancer("rediger")}
                    className={
                      aDuTexte
                        ? "flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-panel px-5 py-3 font-medium text-ink/80 hover:border-ink/30"
                        : "bg-metal flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white"
                    }
                  >
                    <Sparkles className="h-4 w-4" /> Rédiger pour moi
                  </button>
                  {erreur && (
                    <p className="mt-1 text-center text-sm text-[#dc2626]">
                      Service indisponible. Réessaie dans un instant.
                    </p>
                  )}
                </div>
              )}

              {/* Chargement */}
              {chargement && (
                <div className="flex flex-col items-center gap-3 py-8 text-ink/60">
                  <RefreshCw className="h-6 w-6 animate-spin text-pink" />
                  <span className="text-sm">L&apos;IA rédige…</span>
                </div>
              )}

              {/* Suggestion */}
              {!chargement && suggestion !== null && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl border border-ink/10 bg-bg p-4 text-sm leading-relaxed text-ink whitespace-pre-wrap">
                    {suggestion}
                  </div>
                  <button
                    onClick={() => {
                      onApply(suggestion);
                      setOpen(false);
                    }}
                    className="bg-metal flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white"
                  >
                    <Check className="h-4 w-4" /> Utiliser ce texte
                  </button>
                  <button
                    onClick={() => {
                      setSuggestion(null);
                      setErreur(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-ink/60 hover:text-ink"
                  >
                    <RefreshCw className="h-4 w-4" /> Autre proposition
                  </button>
                  <p className="text-center text-[11px] text-ink/40">
                    Relis et ajuste : l&apos;IA peut se tromper.
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
