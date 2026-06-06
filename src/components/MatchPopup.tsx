"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getMyMatches } from "@/lib/messages";
import { getAnnonces, marquerAnnonce } from "@/lib/matchPopup";

// Pop-up affichée partout dans l'app dès qu'un NOUVEAU match apparaît
// (donc B est notifié quand A accepte). Mène à la conversation.
export default function MatchPopup() {
  const { user } = useAuth();
  const [popup, setPopup] = useState<{ id: number; prenom: string } | null>(
    null
  );
  const actif = useRef(true);

  useEffect(() => {
    if (!user) return;
    actif.current = true;

    async function verifier() {
      const ms = await getMyMatches(user!.id);
      const annonces = getAnnonces(user!.id);
      const nouveaux = ms.filter((m) => !annonces.has(m.id));
      if (nouveaux.length === 0) return;
      // getMyMatches est trié du plus récent au plus ancien
      const m = nouveaux[0];
      // on marque tous les nouveaux comme annoncés (pas de répétition)
      nouveaux.forEach((n) => marquerAnnonce(user!.id, n.id));
      if (actif.current) setPopup({ id: m.id, prenom: m.autrePrenom });
    }

    verifier();
    const t = setInterval(verifier, 5000);
    return () => {
      actif.current = false;
      clearInterval(t);
    };
  }, [user]);

  if (!popup) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm"
      onClick={() => setPopup(null)}
    >
      <div
        className="bg-panel-2 glow-pink w-full max-w-sm rounded-3xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <HeartHandshake className="mx-auto h-12 w-12 text-pink" />
        <p className="text-signature mt-3 font-display text-4xl font-bold">
          C&apos;est un match !
        </p>
        <p className="mt-3 text-ink/80">
          <span className="font-semibold">{popup.prenom}</span> a accepté ta
          demande. Lance la conversation !
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/matchs/${popup.id}`}
            onClick={() => setPopup(null)}
            className="bg-signature glow-pink rounded-full px-6 py-3 font-semibold text-white"
          >
            Démarrer la conversation
          </Link>
          <button
            onClick={() => setPopup(null)}
            className="rounded-full px-6 py-3 font-medium text-ink/70 hover:text-ink"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
