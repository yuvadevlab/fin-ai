"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib";
import { UI_COPY } from "@/lib/ui-copy";

export function RegisterView() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.REGISTER();
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
