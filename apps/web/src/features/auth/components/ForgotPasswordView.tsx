"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";

export function ForgotPasswordView() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.FORGOT_PASSWORD();
    }
  }, []);

  return (
    <div className="fn-auth-page">
      <div className="fn-auth-card">
        <h1 className="fn-auth-title">{UI_COPY.AUTH.FORGOT_PASSWORD.TITLE}</h1>
        <p className="fn-auth-desc">{UI_COPY.AUTH.FORGOT_PASSWORD.DESCRIPTION}</p>
      </div>
    </div>
  );
}
