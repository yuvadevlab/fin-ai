export const FEATURE_FLAGS = {
  AI_INSIGHT: process.env.NEXT_PUBLIC_FEATURE_AI_INSIGHT === "true",
};

export const PAGE_FLAGS = {
  AI_ADVISOR: process.env.NEXT_PUBLIC_PAGE_AI_ADVISOR === "true",
  SETTINGS: process.env.NEXT_PUBLIC_PAGE_SETTINGS === "true",
};
