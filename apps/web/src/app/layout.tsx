import React from "react";
import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "@finai/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAI — AI-Powered Personal & Family Finance",
  description:
    "FinAI is an AI-powered dashboard for personal and shared family finances — track expenses, set goals, and get intelligent insights.",
  authors: [{ name: "FinAI" }],
  openGraph: {
    title: "FinAI — AI-Powered Personal & Family Finance",
    description:
      "Track personal and family finances with AI-powered insights, budgets, goals, and investment reports.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
