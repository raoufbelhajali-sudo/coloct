import { Capacitor } from "@capacitor/core";

// Partage un lien/texte. Renvoie true si réellement partagé/copié, false si annulé.
// - App iPhone : feuille de partage NATIVE (plugin Capacitor Share)
// - Web : navigator.share, sinon copie dans le presse-papier
export async function partagerLien(opts: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  const { title, text, url } = opts;

  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, url });
      return true;
    } catch {
      return false; // partage annulé
    }
  }

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText([text, url].filter(Boolean).join(" "));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
