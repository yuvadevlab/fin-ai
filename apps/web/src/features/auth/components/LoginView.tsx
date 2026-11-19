"use client";

import React, { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { StorageKey, AuthQueryParamKey, AuthPrompt } from "@fin-ai/shared-types";
import { DEVLAB_PORTAL_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Client view for FinAI authentication.
 * Automatically delegates authentication to DevLab Portal Central SSO.
 */
export function LoginView() {
  const searchParams = useSearchParams();
  const errorParam =
    searchParams.get(AuthQueryParamKey.ERROR) || searchParams.get(AuthQueryParamKey.AUTH_ERROR);
  const promptParam = searchParams.get(AuthQueryParamKey.PROMPT);

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

      const isForceReAuth = promptParam === AuthPrompt.LOGIN || Boolean(errorParam);
      const portalUrl = DEVLAB_PORTAL_ROUTES.LOGIN({
        redirectUrl: window.location.origin,
        ...(errorParam ? { error: errorParam } : {}),
        prompt: isForceReAuth ? AuthPrompt.LOGIN : undefined,
      });
      window.location.href = portalUrl;
    }
  }, [errorParam, promptParam]);

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
            className="fn-auth-spinner"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="fn-auth-spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="fn-auth-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>

        <h1 className="fn-auth-title">{UI_COPY.AUTH.LOGIN.TITLE}</h1>
        <p className="fn-auth-desc">{UI_COPY.AUTH.LOGIN.DESCRIPTION}</p>

        <div className="fn-auth-actions">
          <button type="button" onClick={handleManualRedirect} className="fn-auth-button">
            {UI_COPY.AUTH.LOGIN.CONTINUE_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
}
