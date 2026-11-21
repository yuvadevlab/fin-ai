/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { FeatureDetailView } from "@/features/marketing/components/features";
import { getFeatureMetadata } from "@/features/marketing/services/features-service";

const SLUG = "ai-financial-advisor";

export const metadata: Metadata = getFeatureMetadata(SLUG);

export default function AiFinancialAdvisorPage() {
  return <FeatureDetailView slug={SLUG} />;
}
