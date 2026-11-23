/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { FeatureDetailView } from "@/features/marketing/components/features";
import { getFeatureMetadata } from "@/features/marketing/services/features-service";

const SLUG = "expense-tracking";

export const metadata: Metadata = getFeatureMetadata(SLUG);

export default function ExpenseTrackingPage() {
  return <FeatureDetailView slug={SLUG} />;
}
