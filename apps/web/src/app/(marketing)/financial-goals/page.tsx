/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { FeatureDetailView } from "@/features/marketing/components/features";
import { getFeatureMetadata } from "@/features/marketing/services/features-service";

const SLUG = "financial-goals";

export const metadata: Metadata = getFeatureMetadata(SLUG);

export default function FinancialGoalsPage() {
  return <FeatureDetailView slug={SLUG} />;
}
