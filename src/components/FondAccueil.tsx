"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Fond blanc partout (web et app). On garde le composant pour pouvoir
// réintroduire un fond plus tard si besoin, mais il ne rend rien pour l'instant.
export default function FondAccueil() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);
  void native;
  return null;
}
