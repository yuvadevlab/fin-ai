/**
 * @file apps/web/src/app/opengraph-image.tsx
 * @description Dynamic Open Graph and Twitter preview image generator for FinAI.
 * @module @fin-ai/web/app
 */

import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FinAI — AI-Powered Personal Finance & Wealth Management";
// eslint-disable-next-line react-refresh/only-export-components
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Generates dynamic 1200x630 social card for link previews across WhatsApp, Twitter, Slack, and Google.
 */
export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 80px",
        background: "linear-gradient(135deg, #020805 0%, #06130d 50%, #0a1f18 100%)",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Ambient Glow Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "250px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-150px",
          width: "600px",
          height: "600px",
          borderRadius: "300px",
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Top Header / Brand Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #37b976 0%, #166534 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(55, 185, 118, 0.4)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
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
          </div>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#f8fafc",
            }}
          >
            Yuva DevLab
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 18px",
            borderRadius: "9999px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#6ee7b7",
            letterSpacing: "0.5px",
          }}
        >
          INTELLIGENT FINANCE
        </div>
      </div>

      {/* Center Hero Information */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "20px",
          zIndex: 10,
          maxWidth: "920px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            background: "linear-gradient(to bottom, #ffffff 40%, #a7f3d0 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            margin: 0,
          }}
        >
          FinAI
        </h1>

        <p
          style={{
            fontSize: "24px",
            lineHeight: 1.4,
            color: "#94a3b8",
            margin: 0,
            maxWidth: "780px",
          }}
        >
          Intelligent financial tracking, automated budgeting, and AI advisor insights powered by
          Google Gemini.
        </p>

        {/* Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(6, 19, 13, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            <span>🤖 AI Financial Advisor</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(6, 19, 13, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            <span>📊 Real-Time Analytics</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(6, 19, 13, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            <span>🎯 Smart Goals</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          fontSize: "15px",
          color: "#64748b",
          borderTop: "1px solid rgba(16, 185, 129, 0.2)",
          paddingTop: "24px",
          zIndex: 10,
        }}
      >
        <span>Personal Wealth & Finance • FinAI</span>
        <span>yuva.devlab@gmail.com</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
