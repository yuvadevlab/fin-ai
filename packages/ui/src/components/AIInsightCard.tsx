import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/utils";

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
        "hover:shadow-primary/5 rounded-2xl p-6 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
        variant === "dark"
          ? "bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-100 ring-1 shadow-black/20 ring-zinc-800/60"
          : "from-background via-accent/20 to-accent/40 text-foreground ring-border/60 bg-gradient-to-br shadow-sm ring-1",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="from-primary shadow-primary/20 flex size-6.5 items-center justify-center rounded-full bg-gradient-to-tr to-indigo-500 shadow-md">
          <Sparkles className="text-primary-foreground size-3.5 animate-pulse" />
        </div>
        <h3 className="from-primary bg-gradient-to-r via-indigo-400 to-violet-500 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
          AI Insight
        </h3>
        {title && (
          <span
            className={cn(
              "ml-auto font-mono text-[9px] font-medium tracking-widest uppercase",
              variant === "dark" ? "text-zinc-500" : "text-muted-foreground",
            )}
          >
            {title}
          </span>
        )}
      </div>
      <p
        className={cn(
          "text-[13px] leading-relaxed font-normal text-pretty",
          variant === "dark" ? "text-zinc-300" : "text-foreground/90",
        )}
      >
        {body}
      </p>
      {children}
      {ctaWrapper && button ? ctaWrapper(button) : button}
    </div>
  );
}
