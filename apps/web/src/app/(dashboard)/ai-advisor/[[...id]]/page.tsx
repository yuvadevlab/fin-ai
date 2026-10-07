/**
 * @file apps/web/src/app/(dashboard)/ai-advisor/[[...id]]/page.tsx
 * @description Catch-all route component rendering the primary AI Advisor conversational workspace.
 * Resolves both root `/ai-advisor` (fresh thread) and deep-linked `/ai-advisor/[id]`.
 * @module @finai/web/app/(dashboard)/ai-advisor/[[...id]]
 */

import { AiAdvisorPage } from "@/features/ai-advisor/components";

/**
 * AI Advisor conversational route page component.
 * Mounts the client {@link AiAdvisorPage} workspace.
 */
export default function AiAdvisorPageRoute() {
  return <AiAdvisorPage />;
}
