/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureDetailView } from "@/features/marketing/components/features";
import {
  getAllFeatureSlugs,
  getFeatureBySlug,
  getFeatureMetadata,
} from "@/features/marketing/services/features-service";

interface FeaturePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  return getFeatureMetadata(slug);
}

export default async function DynamicFeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);

  if (!feature) {
    notFound();
  }

  return <FeatureDetailView doc={feature} />;
}
