import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Petite vibration tactile (no-op silencieux sur web / si non supporté).
export function vibrer(style: ImpactStyle = ImpactStyle.Light) {
  Haptics.impact({ style }).catch(() => {});
}

// Vibration de "succès" (ex. match, message envoyé)
export function vibrerSucces() {
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export { ImpactStyle };
