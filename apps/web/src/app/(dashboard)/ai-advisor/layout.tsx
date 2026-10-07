/**
 * @file apps/web/src/app/(dashboard)/ai-advisor/layout.tsx
 * @description Persistent dashboard layout wrapping AI Advisor routes with AgentChatProvider.
 * @module @finai/web/app/(dashboard)/ai-advisor/layout
 */

import type { Metadata } from "next";
import { AgentChatProvider } from "@/features/ai-advisor/context";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "AI Advisor | FinAI",
  description: "Conversational financial advisor and autonomous money assistant.",
};

/**
 * Persistent layout for AI Advisor. Houses the AgentChatProvider to ensure
 * chat state and SSE streams persist across route transitions without remounting.
 */
export default function AiAdvisorLayout({ children }: { children?: React.ReactNode }) {
  return <AgentChatProvider>{children}</AgentChatProvider>;
}
