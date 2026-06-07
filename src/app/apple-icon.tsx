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
            <circle cx="17" cy="15" r="9" />
            <rect x="13.5" y="15" width="7" height="25" rx="3.5" />
            <rect x="20" y="11" width="16" height="6.5" rx="2.5" />
            <rect x="20" y="22.5" width="11" height="6.5" rx="2.5" />
          </g>
          <circle cx="17" cy="15" r="3.4" fill="#fa5252" />
        </svg>
      </div>
    ),
    size
  );
}
