"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Search, ChevronDown, ArrowRight } from "lucide-react";

type QA = { q: string; a: string; href?: string; cta?: string };

// Questions fréquentes + le "chemin" (page) vers lequel emmener l'utilisateur.
const FAQ: QA[] = [
  {
    q: "Comment ça marche, en bref ?",
    a: "Tu swipes des logements (colocations et locations) : un like à droite (✓), un non à gauche (✕). Si l'annonceur te like aussi, c'est un match et la messagerie s'ouvre pour discuter.",
    href: "/",
    cta: "Revoir l'accueil",
  },
  {
    q: "Comment m'inscrire / commencer ?",
    a: "Crée ton compte en 2 minutes, complète ton profil, et tu peux swiper. C'est gratuit.",
    href: "/connexion",
    cta: "Créer mon compte",
  },
  {
    q: "Comment swiper des annonces ?",
    a: "Une fois connecté, va sur la page Swipe : like à droite, passe à gauche. Tu peux filtrer par ville et budget.",
    href: "/swipe",
    cta: "Aller swiper",
  },
  {
    q: "J'ai une chambre ou un logement — comment publier une annonce ?",
    a: "Connecte-toi, puis crée ton annonce depuis « Mon annonce ». Tu choisis ensuite qui te contacte.",
    href: "/mon-annonce",
    cta: "Publier une annonce",
  },
  {
    q: "C'est payant ?",
    a: "Non : l'inscription, le swipe et le match sont gratuits. Des options pour aller plus vite (Pack Swiper, Boost) sont payantes, sans engagement.",
    href: "/boutique",
    cta: "Voir les options",
  },
  {
    q: "Comment fonctionne un match ?",
    a: "Quand toi et l'annonceur vous êtes likés mutuellement, c'est un match : la messagerie s'ouvre pour discuter, sans donner ton numéro.",
    href: "/notifs",
    cta: "Mes matchs & messages",
  },
  {
    q: "Colocation ou location ?",
    a: "Les deux ! Tu indiques ce que tu cherches à l'inscription, et tu ne vois que les annonces qui correspondent.",
  },
  {
    q: "Comment modifier mon profil ou mes photos ?",
    a: "Va dans Profil pour mettre à jour tes infos, tes photos et tes préférences.",
    href: "/profil",
    cta: "Mon profil",
  },
  {
    q: "Email, mot de passe, téléphone ?",
    a: "Tu gères tout ça dans les Paramètres du compte.",
    href: "/compte",
    cta: "Paramètres du compte",
  },
  {
    q: "Un souci ou une question pas listée ?",
    a: "Écris-nous, on te répond vite.",
    href: "/contact",
    cta: "Nous contacter",
  },
];

export default function AideFAQ({
  className = "",
  label = "Aide / FAQ",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [exp, setExp] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const q = query.trim().toLowerCase();
  const liste = q
    ? FAQ.filter((f) => (f.q + " " + f.a).toLowerCase().includes(q))
    : FAQ;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-panel-2"
        }
      >
        <HelpCircle className="h-4 w-4 text-bleu" />
        {label ? <span>{label}</span> : null}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-bg shadow-2xl"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <p className="flex items-center gap-2 font-display text-lg font-bold">
                  <HelpCircle className="h-5 w-5 text-bleu" /> Aide &amp; FAQ
                </p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="text-ink/40 transition-colors hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Recherche */}
              <div className="px-5 pt-4">
                <div className="flex items-center gap-2 rounded-full bg-panel px-4 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-ink/40" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setExp(null);
                    }}
                    placeholder="Pose ta question…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
                  />
                </div>
              </div>

              {/* Liste des questions */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {liste.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink/55">
                    Aucune réponse trouvée.{" "}
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="font-semibold text-pink"
                    >
                      Écris-nous
                    </Link>{" "}
                    et on te répond.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {liste.map((f, i) => {
                      const ouvert = exp === i;
                      return (
                        <li key={f.q} className="overflow-hidden rounded-2xl bg-panel">
                          <button
                            onClick={() => setExp(ouvert ? null : i)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
                          >
                            {f.q}
                            <ChevronDown
                              className={
                                "h-4 w-4 shrink-0 text-ink/40 transition-transform " +
                                (ouvert ? "rotate-180" : "")
                              }
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {ouvert && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 text-sm text-ink/75">
                                  <p>{f.a}</p>
                                  {f.href && (
                                    <Link
                                      href={f.href}
                                      onClick={() => setOpen(false)}
                                      className="bg-signature mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white"
                                    >
                                      {f.cta || "M'y emmener"}{" "}
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Pied */}
              <div className="border-t border-ink/10 px-5 py-3 text-center text-xs text-ink/50">
                Tu ne trouves pas ta réponse ?{" "}
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-pink"
                >
                  Contacte-nous
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
