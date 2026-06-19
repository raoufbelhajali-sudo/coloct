import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

// Petite vibration tactile (no-op silencieux sur web / si non supporté).
export function vibrer(style: ImpactStyle = ImpactStyle.Light) {
  Haptics.impact({ style }).catch(() => {});
}

// Petit son "pop" agréable — joué sur PC (web), où il n'y a pas de vibration.
// Sur mobile natif, on garde la vibration (pas de son) pour rester discret.
let audioCtx: AudioContext | null = null;
export function sonLike() {
  if (typeof window === "undefined") return;
  if (Capacitor.isNativePlatform()) return; // mobile → vibration, pas de son
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = audioCtx || new Ctx();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    // Deux notes montantes (do → sol) : petit "pop" joyeux
    o.frequency.setValueAtTime(523.25, t);
    o.frequency.exponentialRampToValueAtTime(783.99, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.24);
  } catch {
    /* audio non disponible */
  }
}

// Vibration de "succès" (ex. match, message envoyé)
export function vibrerSucces() {
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export { ImpactStyle };
