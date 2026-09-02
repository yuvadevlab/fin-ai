import React from "react";
import { ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../primitives/tooltip";
import { cn } from "../lib/utils";

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
  if (isRail) {
    return (
      <div className={cn("p-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/ai-advisor"
              onClick={onNavigate}
              aria-label="AI Advisor: Ready"
              className="bg-secondary/40 hover:bg-secondary/80 border-border/70 mx-auto flex size-10 items-center justify-center rounded-xl border transition-all"
            >
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <p className="text-xs font-semibold">AI Advisor — Ready</p>
            <p className="text-muted-foreground text-[10px]">Click to open advisor</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn("p-4", className)}>
      <Link
        href="/ai-advisor"
        onClick={onNavigate}
        className="group border-border/70 hover:border-primary/40 bg-secondary/30 hover:bg-secondary/60 relative block overflow-hidden rounded-2xl border p-3.5 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-foreground text-xs font-semibold">AI Advisor</span>
          </div>
          <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 text-[10px] font-medium">
            Ready
          </span>
        </div>
        <p className="text-muted-foreground mt-1.5 text-[11px] leading-snug">
          Get personalized insights & wealth optimization.
        </p>
        <div className="text-primary mt-2.5 flex items-center gap-1 text-xs font-medium group-hover:underline">
          <span>Ask question</span>
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </Link>
    </div>
  );
}
