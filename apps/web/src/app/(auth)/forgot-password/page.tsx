import React from "react";
import type { Metadata } from "next";
import { ForgotPasswordView } from "@/features/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Forgot Password — FinAI",
  description: "Recover access to your FinAI account.",
};

/**
 * Pure SSR Server Component route wrapper for FinAI password recovery.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
