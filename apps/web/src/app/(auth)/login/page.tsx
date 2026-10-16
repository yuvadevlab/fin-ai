import React from "react";
import type { Metadata } from "next";
import { LoginView } from "@/features/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Sign In — FinAI",
  description: "Sign in to your FinAI personal wealth and finance management dashboard.",
};

/**
 * Pure SSR Server Component route wrapper for FinAI login.
 */
export default function LoginPage() {
  return <LoginView />;
}
