import { ImageResponse } from "next/og";

// Icône pour l'écran d'accueil iOS (iOS arrondit les coins lui-même)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fa5252, #fd7e14)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48">
          <g fill="#ffffff">
            <rect x="14" y="9" width="8" height="24" rx="3" />
            <rect x="14" y="9" width="21" height="7" rx="3" />
            <rect x="14" y="19" width="15" height="7" rx="3" />
          </g>
          <circle cx="18" cy="36" r="7" fill="none" stroke="#ffffff" strokeWidth="8" />
        </svg>
      </div>
    ),
    size
  );
}
