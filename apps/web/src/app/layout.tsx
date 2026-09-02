import React from "react";
import type { Metadata } from "next";
import { QueryProvider, AppearanceProvider } from "@/providers";
import { Toaster } from "@finai/ui";
import { appearanceScript } from "@/lib/appearance-script";
import "@finai/ui/styles.css";
import "./globals.css";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "FinAI — AI-Powered Personal Finance",
  description:
    "FinAI is an AI-powered dashboard for personal finances — track expenses, set budgets, achieve goals, and get intelligent insights.",
  authors: [{ name: "FinAI" }],
  openGraph: {
    title: "FinAI — AI-Powered Personal Finance",
    description:
      "Track personal finances with AI-powered insights, budgets, goals, and investment reports.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Blocking script — must live in <head> so it runs synchronously
         * before the first paint. See src/lib/appearance-script.ts for details.
         */}
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="antialiased">
        {/*
         * Skip-to-content link — visually hidden until focused via Tab key.
         * Allows keyboard-only and screen-reader users to bypass the sidebar
         * navigation and jump straight to the main page content.
         */}
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground focus:ring-ring fixed top-4 left-4 z-9999 -translate-y-20 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition-transform focus:translate-y-0 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>

        <QueryProvider>
          <AppearanceProvider>
            {children}
            <Toaster />
          </AppearanceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
