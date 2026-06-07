"use client";

import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ajouterBonusLikes } from "@/lib/swipes";

const BONUS = 5; // swipes gagnés par invitation

// Bouton "Inviter des amis et gagner des swipes" (partage + bonus).
export default function InviterAmis({
  onBonus,
  className = "",
}: {
  onBonus?: () => void;
  className?: string;
}) {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  async function inviter() {
    const lien = `${window.location.origin}/?ref=${user?.id ?? ""}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "FlatSwiper",
          text: "Rejoins-moi sur FlatSwiper pour trouver une coloc à Paris !",
          url: lien,
        });
      } else {
        await navigator.clipboard.writeText(lien);
      }
      if (user) {
        ajouterBonusLikes(user.id, BONUS);
        onBonus?.();
      }
      setMsg(`Merci ! +${BONUS} swipes ajoutés`);
      setTimeout(() => setMsg(""), 3000);
    } catch {
      /* partage annulé : pas de bonus */
    }
  }

  return (
    <div>
      <button
        onClick={inviter}
        className={
          "flex w-full items-center justify-center gap-2 rounded-full bg-panel-2 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:text-pink " +
          className
        }
      >
        <UserPlus className="h-4 w-4" />
        Inviter des amis · +{BONUS} swipes
      </button>
      {msg && (
        <p className="mt-2 flex items-center justify-center gap-1 text-sm text-pink">
          <Check className="h-4 w-4" strokeWidth={3} /> {msg}
        </p>
      )}
    </div>
  );
}
