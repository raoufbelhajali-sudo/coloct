"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

/* ============================================================
   Démo d'onboarding — s'affiche AVANT l'écran de connexion
   (Google / e-mail), sur toutes les interfaces (web + app).
   4 écrans :
     1. Le slogan du site
     2. La légèreté & le design
     3. Inscription en 1 minute
     4. Animation du rond + bouton « Démarrer »
   Vu une seule fois (localStorage). Glisser ou « Suivant ».
   ============================================================ */

const CLE = "fs-onboarding-vu";
const TOTAL = 4;

// Cercle dégradé qui « respire » (réutilisé du splash d'accueil)
function Rond({ size = 130 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ filter: "drop-shadow(0 0 28px rgba(54,197,224,0.55))" }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="onbRing" x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#36c5e0" />
            <stop offset="100%" stopColor="#2456db" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#onbRing)" />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="#1b1f3c"
          style={{ transformOrigin: "50px 50px" }}
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 320 : -320, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -320 : 320, opacity: 0 }),
};

export default function OnboardingDemo() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (localStorage.getItem(CLE)) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  function terminer() {
    localStorage.setItem(CLE, "1");
    setVisible(false);
  }

  function aller(n: number) {
    if (n < 0) return;
    if (n >= TOTAL) {
      terminer();
      return;
    }
    setPage([n, n > page ? 1 : -1]);
  }

  if (!visible) return null;

  // Contenu de chaque écran
  function ecran(i: number) {
    if (i === 0) {
      return (
        <div className="flex flex-col items-center gap-5 text-center">
          <h1 className="pb-1 font-display text-5xl font-bold leading-[1.18] sm:text-6xl">
            <span className="block text-white">Swipe.</span>
            <span className="block text-[#fa5252]">Matche.</span>
            <span className="block pb-[0.12em] text-signature">Emménage.</span>
          </h1>
          <p className="max-w-xs text-lg text-white/70">
            Colocation ou location, trouve ton futur chez-toi en swipant.
          </p>
        </div>
      );
    }
    if (i === 1) {
      return (
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="bg-signature flex h-24 w-24 items-center justify-center rounded-[28px]"
            style={{ filter: "drop-shadow(0 0 28px rgba(54,197,224,0.5))" }}
          >
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white">Léger &amp; élégant</h2>
          <p className="max-w-xs text-lg text-white/70">
            Une expérience fluide et soignée, pensée pour aller à l&apos;essentiel —
            sans prise de tête.
          </p>
        </div>
      );
    }
    if (i === 2) {
      return (
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="bg-signature flex h-24 w-24 items-center justify-center rounded-[28px]"
            style={{ filter: "drop-shadow(0 0 28px rgba(54,197,224,0.5))" }}
          >
            <Zap className="h-12 w-12 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white">Inscription en 1 minute</h2>
          <p className="max-w-xs text-lg text-white/70">
            Crée ton compte en quelques secondes et commence à swiper tout de suite.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-8 text-center">
        <Rond />
        <h2 className="font-display text-4xl font-bold text-white">C&apos;est parti&nbsp;!</h2>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black px-6 pb-10 pt-6">
      {/* Passer (sauf dernier écran) */}
      <div className="flex h-8 justify-end">
        {page < TOTAL - 1 && (
          <button
            type="button"
            onClick={terminer}
            className="text-sm font-semibold text-white/50 transition-colors hover:text-white"
          >
            Passer
          </button>
        )}
      </div>

      {/* Écran courant (glissable) */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) aller(page + 1);
              else if (info.offset.x > 80) aller(page - 1);
            }}
            className="w-full cursor-grab active:cursor-grabbing"
          >
            <div className="flex justify-center">{ecran(page)}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bas : points + bouton */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Écran ${i + 1}`}
              onClick={() => setPage([i, i > page ? 1 : -1])}
              className={
                "h-2 rounded-full transition-all " +
                (i === page ? "w-6 bg-white" : "w-2 bg-white/30")
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => aller(page + 1)}
          className="bg-signature glow-pink flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white"
        >
          {page < TOTAL - 1 ? (
            <>
              Suivant <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            "Démarrer"
          )}
        </button>
      </div>
    </div>
  );
}
