"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Image d'ambiance en fond, très transparente, sur TOUT le site web.
// Désactivée dans l'app iPhone (native).
export default function FondAccueil() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  if (native) return null; // pas d'image dans l'app

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-[0.16]"
      style={{ backgroundImage: "url(/accueil-bg.jpg)" }}
    />
  );
}
