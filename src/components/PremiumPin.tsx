"use client";

import { Star, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { estPremium, estHero } from "@/lib/offers";

// Petit pin de statut payant, à côté du pin de rôle.
// - HeroSwiper actif  → "HeroS" en bleu
// - Pack Swiper actif → "Swiper" en corail
// - sinon             → rien
export default function PremiumPin() {
  const { profile } = useAuth();
  if (!profile) return null;

  if (estHero(profile)) {
    return (
      <span className="bg-bleu inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
        <Star className="h-3 w-3" fill="currentColor" /> HeroS
      </span>
    );
  }

  if (estPremium(profile)) {
    return (
      <span className="bg-signature inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
        <Zap className="h-3 w-3" fill="currentColor" /> Swiper
      </span>
    );
  }

  return null;
}
