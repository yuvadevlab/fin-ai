"use client";

/**
 * @file apps/web/src/features/auth/components/RegisterView.tsx
 * @description Client-side fallback view for /register route.
 * Redirects to the curated early access waitlist workflow on the homepage.
 * @module @fin-ai/web/features/auth/components/RegisterView
 */

import React, { useEffect } from "react";
import { APP_ROUTES } from "@/lib/routes";
import { UI_COPY } from "@/lib/ui-copy";
import { EarlyAccessQueryParamKey } from "@/features/marketing/context/EarlyAccessContext";

export function RegisterView(): React.JSX.Element {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams();
      searchParams.set(EarlyAccessQueryParamKey.EARLY_ACCESS, "true");
      window.location.replace(`${APP_ROUTES.HOME}?${searchParams.toString()}`);
    }
  }, []);

  return (
    <div className="fn-auth-page">
      <div className="fn-auth-card">
        <h1 className="fn-auth-title">{UI_COPY.AUTH.REGISTER.TITLE}</h1>
        <p className="fn-auth-desc">{UI_COPY.AUTH.REGISTER.DESCRIPTION}</p>
      </div>
    </div>
  );
}
