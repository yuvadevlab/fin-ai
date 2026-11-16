import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginView } from "@/features/auth";
import { COMMON_COPY } from "@/lib/ui-copy/common";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: COMMON_COPY.METADATA.LOGIN_TITLE,
  description: COMMON_COPY.METADATA.LOGIN_DESCRIPTION,
  openGraph: {
    title: COMMON_COPY.METADATA.LOGIN_OG_TITLE,
    description: COMMON_COPY.METADATA.LOGIN_OG_DESCRIPTION,
    url: "/login",
  },
  twitter: {
    card: "summary_large_image",
    title: COMMON_COPY.METADATA.LOGIN_OG_TITLE,
    description: COMMON_COPY.METADATA.LOGIN_OG_DESCRIPTION,
  },
};

/**
 * Pure SSR Server Component route wrapper for FinAI login.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
