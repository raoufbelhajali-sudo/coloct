import { ImageResponse } from "next/og";

// Icône pour l'écran d'accueil iOS (iOS arrondit les coins lui-même)
export const dynamic = "force-static";
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
            <rect x="14" y="7" width="8" height="24" rx="3" />
            <rect x="14" y="7" width="21" height="7" rx="3" />
            <rect x="14" y="16" width="15" height="7" rx="3" />
            <circle cx="18" cy="38" r="9" />
          </g>
          <path
            fill="#fa5252"
            transform="translate(12 32) scale(0.5)"
            d="M12 21 C12 21 3 15 3 8.5 C3 5.4 5.5 3 8.5 3 C10.3 3 11.5 4 12 5 C12.5 4 13.7 3 15.5 3 C18.5 3 21 5.4 21 8.5 C21 15 12 21 12 21 Z"
          />
        </svg>
      </div>
    ),
    size
  );
}
