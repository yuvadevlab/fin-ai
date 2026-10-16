"use client";

import React, { useEffect } from "react";
import { GATEWAY_URL, APP_ID } from "@/lib";

export function RegisterView() {
  const portalUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_URL || GATEWAY_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = portalUrl + "/register?app=" + encodeURIComponent(APP_ID);
    }
  }, [portalUrl]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl">
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          Redirecting to DevLab Registration
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          New user registration is managed centrally at DevLab Portal...
        </p>
      </div>
    </div>
  );
}
