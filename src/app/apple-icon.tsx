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
          background: "linear-gradient(135deg, #ff4d8d, #8b5cf6)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48">
          <g fill="#ffffff">
            <path d="M24 4 L45 22 a2.5 2.5 0 0 1 -1.6 4.4 H4.6 A2.5 2.5 0 0 1 3 22 Z" />
            <rect x="9" y="23" width="30" height="21" rx="6" />
          </g>
          <path
            fill="#ff4d8d"
            transform="translate(13.5 25.5) scale(0.86)"
            d="M11 19.5C11 19.5 1.5 14 1.5 7.6 1.5 4.5 3.9 2.2 6.9 2.2c1.8 0 3.4.9 4.1 2.3.7-1.4 2.3-2.3 4.1-2.3 3 0 5.4 2.3 5.4 5.4C20.5 14 11 19.5 11 19.5Z"
          />
        </svg>
      </div>
    ),
    size
  );
}
