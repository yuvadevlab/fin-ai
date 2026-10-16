import type { Metadata } from "next";
import { ResetPasswordView } from "@/features/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Reset Password — FinAI",
  description: "Set a new password for your FinAI account.",
};

/**
 * Pure SSR Server wrapper for FinAI password reset route.
 * Renders the interactive client view.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
