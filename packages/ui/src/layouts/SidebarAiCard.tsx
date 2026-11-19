import React from "react";
import { ArrowRight } from "lucide-react";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@yuva-devlab/ui";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

export interface SidebarAiCardProps {
  isRail: boolean;
  onNavigate?: () => void;
  LinkComponent: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    "aria-label"?: string;
  }>;
  className?: string;
}

export function SidebarAiCard({
  isRail,
  onNavigate,
  LinkComponent: Link,
  className,
}: SidebarAiCardProps) {
  const copy = UI_COPY_CONSTANTS.SIDEBAR_AI_CARD;

  if (isRail) {
    return (
      <div className={cn("fn-sidebar-ai-rail-wrap", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/ai-advisor"
              onClick={onNavigate}
              aria-label={copy.READY_ARIA}
              className="fn-sidebar-ai-rail-btn"
            >
              <span className="fn-topbar-ping-wrap" aria-hidden="true">
                <span className="fn-topbar-ping-dot-pulse" />
                <span className="fn-topbar-ping-dot" />
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <p className="fn-sidebar-tooltip-title">{copy.TOOLTIP_TITLE}</p>
            <p className="fn-sidebar-tooltip-desc">{copy.CLICK_TO_OPEN}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn("fn-sidebar-ai-card-wrap", className)}>
      <Link href="/ai-advisor" onClick={onNavigate} className="fn-sidebar-ai-card">
        <div className="fn-sidebar-ai-header">
          <div className="fn-sidebar-ai-title-wrap">
            <span className="fn-topbar-ping-wrap" aria-hidden="true">
              <span className="fn-topbar-ping-dot-pulse" />
              <span className="fn-topbar-ping-dot" />
            </span>
            <span className="fn-sidebar-ai-title">{copy.TITLE}</span>
          </div>
          <span className="fn-sidebar-ai-badge">{copy.BADGE_READY}</span>
        </div>
        <p className="fn-sidebar-ai-desc">{copy.DESCRIPTION}</p>
        <div className="fn-sidebar-ai-action">
          <span>{copy.ACTION_TEXT}</span>
          <ArrowRight className="fn-sidebar-ai-action-icon" aria-hidden="true" />
        </div>
      </Link>
    </div>
  );
}
