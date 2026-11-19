import React from "react";
import { Eye } from "lucide-react";
import { Badge, cn } from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface ReadOnlyWorkspaceBannerProps {
  className?: string;
}

export function ReadOnlyWorkspaceBanner({ className }: ReadOnlyWorkspaceBannerProps) {
  return (
    <div role="status" className={cn("fn-readonly-banner", className)}>
      <div className="fn-readonly-banner-content">
        <div className="fn-readonly-banner-icon">
          <Eye size={14} aria-hidden="true" />
        </div>
        <p className="fn-readonly-banner-text">{UI_COPY.WORKSPACES.READ_ONLY_BANNER}</p>
      </div>
      <Badge variant="secondary" className="fn-readonly-banner-badge">
        {UI_COPY.WORKSPACES.READ_ONLY_BADGE}
      </Badge>
    </div>
  );
}
