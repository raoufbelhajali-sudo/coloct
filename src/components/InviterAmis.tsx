"use client";

import { useEffect, useState } from "react";
import { UserPlus, Check, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { partagerLien } from "@/lib/share";
import { getNbFilleuls, BONUS_PARRAIN } from "@/lib/parrainage";

// Parrainage : partage ton lien. Quand un ami s'inscrit via ce lien, tu gagnes
// +BONUS_PARRAIN swipes/jour (récompense côté serveur, persistante).
export default function InviterAmis({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const [nbFilleuls, setNbFilleuls] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) getNbFilleuls(user.id).then(setNbFilleuls);
  }, [user]);

  async function inviter() {
    const lien = `https://flatswiper.com/?ref=${user?.id ?? ""}`;
    const ok = await partagerLien({
      title: "FlatSwiper",
      text: "Rejoins-moi sur FlatSwiper pour trouver une coloc partout en France !",
      url: lien,
    });
    if (!ok) return; // partage annulé
    setMsg(
      `Lien partagé ! Tu gagneras +${BONUS_PARRAIN} swipes/jour dès qu'il s'inscrit.`
    );
    setTimeout(() => setMsg(""), 5000);
  }

  return (
    <div>
      <button
        onClick={inviter}
        className={
          "flex w-full items-center justify-center gap-2 rounded-full bg-panel-2 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:text-bleu " +
          className
        }
      >
        <UserPlus className="h-4 w-4" />
        Inviter des amis · +{BONUS_PARRAIN} swipes/jour par ami
      </button>

      {/* Stats de parrainage */}
      {nbFilleuls > 0 && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-violet">
          <Gift className="h-4 w-4" />
          {nbFilleuls} ami{nbFilleuls > 1 ? "s" : ""} parrainé
          {nbFilleuls > 1 ? "s" : ""} · +{nbFilleuls * BONUS_PARRAIN} swipes/jour
        </p>
      )}

      {msg && (
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-sm text-pink">
          <Check className="h-4 w-4 shrink-0" strokeWidth={3} /> {msg}
        </p>
      )}
    </div>
  );
}
