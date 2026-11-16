/**
 * @file apps/web/src/app/apple-icon.tsx
 * @description Dynamic Apple Touch Icon for FinAI.
 * @module @finai/web/app
 */

import { ImageResponse } from "next/og";

// eslint-disable-next-line react-refresh/only-export-components
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * Generates Apple Touch Icon for mobile home screens using exact Lucide ChartNoAxesCombined icon with primary #37b976.
 */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#06130d",
        borderRadius: "36px",
        border: "2px solid rgba(55, 185, 118, 0.4)",
      }}
    >
      <svg
        width="108"
        height="108"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#37b976"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16v5" />
        <path d="M16 14v7" />
        <path d="M20 10v11" />
        <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
        <path d="M4 18v3" />
        <path d="M8 14v7" />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
