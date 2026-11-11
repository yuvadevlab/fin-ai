"use client";

import React, { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { StorageKey } from "@finai/shared-types";
import { DEVLAB_PORTAL_ROUTES } from "@/lib";

/**
 * Client view for FinAI authentication.
 * Automatically delegates authentication to DevLab Portal Central SSO.
 */
export function LoginView() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error") || searchParams.get("auth_error");

  const purgeAndRedirect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(StorageKey.TOKEN);
      localStorage.removeItem(StorageKey.USER);
      localStorage.removeItem(StorageKey.DEVLAB_ACCESS_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_TOKEN);
      localStorage.removeItem(StorageKey.DEVLAB_AUTH_USER);
      localStorage.removeItem(StorageKey.WORKSPACE_ID);
      document.cookie = `${StorageKey.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${StorageKey.DEVLAB_ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${StorageKey.WORKSPACE_ID}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      const portalUrl = DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: window.location.origin,
        ...(errorParam ? { error: errorParam, prompt: "login" } : {}),
      });
      window.location.href = portalUrl;
    }
  }, [errorParam]);

  useEffect(() => {
    purgeAndRedirect();
  }, [purgeAndRedirect]);

  const handleManualRedirect = () => {
    purgeAndRedirect();
  };

  return (
    <div className="fn-auth-page">
      <div className="fn-auth-card">
        <div className="fn-auth-icon">
          <svg
            className="size-8 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>

        <h1 className="text-foreground text-xl font-bold tracking-tight">
          Redirecting to DevLab SSO
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Single Sign-On is required to access FinAI. You are being redirected to the DevLab
          Portal...
        </p>

        <div className="mt-6">
          <button type="button" onClick={handleManualRedirect} className="fn-auth-button">
            Continue to DevLab Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
