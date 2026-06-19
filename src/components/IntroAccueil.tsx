"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   Intro d'accueil (onboarding) — site web uniquement.
   Fond noir, le cercle bleu du logo qui "respire" (grandit /
   diminue), puis le slogan animé « Swipe. / Matche. / Emménage. ».
   Durée totale : 4 secondes, puis on découvre le site.
   S'affiche une fois par session (sessionStorage).
   ============================================================ */

const DUREE_MS = 4000; // 4 secondes
const CLE = "fs-intro-vu";

export default function IntroAccueil() {
  // null = on ne sait pas encore (évite le flash au montage)
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    // Déjà vue dans cette session → on ne la rejoue pas
    if (sessionStorage.getItem(CLE)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      sessionStorage.setItem(CLE, "1");
      setVisible(false);
    }, DUREE_MS);
    return () => clearTimeout(t);
  }, []);

  // Lignes du slogan : couleur + délai d'apparition
  const lignes = [
    { mot: "Swipe.", cls: "text-white", delai: 0.6 },
    { mot: "Matche.", cls: "text-[#fa5252]", delai: 1.1 },
    { mot: "Emménage.", cls: "text-signature", delai: 1.6 },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // on autorise à passer l'intro en cliquant
          onClick={() => {
            sessionStorage.setItem(CLE, "1");
            setVisible(false);
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-8 bg-black"
        >
          {/* Cercle du logo : anneau dégradé bleu + centre bleu nuit qui pulse */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 28px rgba(54,197,224,0.55))" }}
          >
            <svg width="140" height="140" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="introRing" x1="0%" y1="15%" x2="100%" y2="85%">
                  <stop offset="0%" stopColor="#36c5e0" />
                  <stop offset="100%" stopColor="#2456db" />
                </linearGradient>
              </defs>
              {/* Anneau dégradé (fixe) */}
              <circle cx="50" cy="50" r="50" fill="url(#introRing)" />
              {/* Centre bleu nuit qui grandit et diminue (respiration) */}
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

          {/* Slogan animé */}
          <h1 className="text-center font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
            {lignes.map((l) => (
              <motion.span
                key={l.mot}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: l.delai, ease: "easeOut" }}
                className={"block " + l.cls}
              >
                {l.mot}
              </motion.span>
            ))}
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
