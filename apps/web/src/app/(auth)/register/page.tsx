import React from "react";
import type { Metadata } from "next";
import { RegisterView } from "@/features/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Register — FinAI",
  description: "Create an account for FinAI personal wealth and finance management dashboard.",
};

/**
 * Pure SSR Server Component route wrapper for FinAI registration.
 */
export default function RegisterPage() {
  return <RegisterView />;
}
