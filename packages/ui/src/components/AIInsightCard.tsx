import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { cn } from "../lib/utils";
import { UI_COPY_CONSTANTS } from "../constants/ui-copy.constants";

interface AIInsightCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  body: React.ReactNode;
  cta?: string;
  variant?: "dark" | "light";
  onCtaClick?: () => void;
  ctaWrapper?: (button: React.ReactNode) => React.ReactNode;
  children?: React.ReactNode;
}

export function AIInsightCard({
  title,
  body,
  cta = UI_COPY_CONSTANTS.AI_INSIGHT_CARD.CTA,
  variant = "dark",
  onCtaClick,
  ctaWrapper,
  children,
  className,
  ...props
}: AIInsightCardProps) {
  const isDark = variant === "dark";

  const button = cta ? (
    <Button
      variant={isDark ? "secondary" : "default"}
      size="sm"
      onClick={onCtaClick}
      className={cn("fn-ai-insight-cta", isDark && "fn-ai-insight-cta--dark")}
    >
      {cta}
    </Button>
  ) : null;

  return (
    <div
      className={cn(
        "fn-ai-insight-card",
        isDark ? "fn-ai-insight-card--dark" : "fn-ai-insight-card--light",
        className,
      )}
      {...props}
    >
      <div className="fn-ai-insight-header">
        <div className="fn-ai-insight-icon-box">
          <Sparkles className="fn-ai-insight-icon" />
        </div>
        <h3 className="fn-ai-insight-title">{UI_COPY_CONSTANTS.AI_INSIGHT_CARD.TITLE}</h3>
        {title && (
          <span
            className={cn(
              "fn-ai-insight-badge",
              isDark ? "fn-ai-insight-badge--dark" : "fn-ai-insight-badge--light",
            )}
          >
            {title}
          </span>
        )}
      </div>
      <p
        className={cn(
          "fn-ai-insight-body",
          isDark ? "fn-ai-insight-body--dark" : "fn-ai-insight-body--light",
        )}
      >
        {body}
      </p>
      {children}
      {ctaWrapper && button ? ctaWrapper(button) : button}
    </div>
  );
}
