/**
 * @file apps/web/src/features/marketing/index.ts
 * @description Centralized barrel exports for the FinAI marketing module.
 * @module @fin-ai/web/features/marketing
 */

export * from "./data/features-registry.types";
export * from "./data/features-registry";
export * from "./data/blog-posts.types";
export * from "./data/blog-posts";

export * from "./services/features-service";
export * from "./services/blog-service";

export * from "./context/EarlyAccessContext";
export * from "./components/EarlyAccessModal";
export * from "./components/PublicHeader";
export * from "./components/PublicFooter";
export * from "./components/HeroSection";
export * from "./components/DashboardPreviewSection";
export * from "./components/CorePillarsSection";
export * from "./components/HowItWorksSection";
export * from "./components/SecuritySection";
export * from "./components/FaqSection";
export * from "./components/CtaBannerSection";
export * from "./components/FeatureDeepDiveView";
export * from "./components/features";
export * from "./components/blog";
