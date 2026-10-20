"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib";

/**
 * Client view for FinAI authentication.
 * Automatically delegates authentication to DevLab Portal Central SSO.
 */
export function LoginView() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN(window.location.origin);
    }
  }, []);

  const handleManualRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN(window.location.origin);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl">
        <div className="bg-primary/10 text-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
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
          <button
            type="button"
            onClick={handleManualRedirect}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium shadow transition focus:ring-2 focus:outline-none"
          >
            Continue to DevLab Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
