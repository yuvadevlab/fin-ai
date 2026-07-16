import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/utils";

interface AIInsightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
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
  cta = "Review details",
  variant = "dark",
  onCtaClick,
  ctaWrapper,
  children,
  className,
  ...props
}: AIInsightCardProps) {
  const button = cta ? (
    <Button
      variant={variant === "dark" ? "secondary" : "default"}
      size="sm"
      onClick={onCtaClick}
      className={cn(
        "mt-5 w-full rounded-lg font-medium",
        variant === "dark" && "bg-zinc-800 text-white ring-1 ring-white/5 hover:bg-zinc-700",
      )}
    >
      {cta}
    </Button>
  ) : null;

  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-lg ring-1 transition hover:shadow-xl/5",
        variant === "dark"
          ? "bg-zinc-900 text-zinc-100 ring-zinc-800"
          : "bg-accent text-accent-foreground ring-border/50",
        className,
      )}
      {...props}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-primary flex size-6 items-center justify-center rounded-full shadow-sm">
          <Sparkles className="text-primary-foreground size-3.5 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold">AI Insight</h3>
        {title && (
          <span
            className={cn(
              "ml-auto font-mono text-[10px] tracking-widest uppercase",
              variant === "dark" ? "text-zinc-400" : "text-muted-foreground",
            )}
          >
            {title}
          </span>
        )}
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed text-pretty",
          variant === "dark" ? "text-zinc-300" : "text-foreground/80",
        )}
      >
        {body}
      </p>
      {children}
      {ctaWrapper && button ? ctaWrapper(button) : button}
    </div>
  );
}
