import React from "react";
import { Eye } from "lucide-react";
import { Badge } from "@finai/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface ReadOnlyWorkspaceBannerProps {
  className?: string;
}

export function ReadOnlyWorkspaceBanner({ className }: ReadOnlyWorkspaceBannerProps) {
  return (
    <div
      role="status"
      className={
        "border-border/60 bg-muted/40 text-muted-foreground flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs backdrop-blur-xs " +
        (className ?? "")
      }
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="bg-secondary text-foreground/80 flex size-6 shrink-0 items-center justify-center rounded-lg">
          <Eye className="size-3.5" aria-hidden="true" />
        </div>
        <p className="text-muted-foreground font-normal text-pretty">
          {UI_COPY.WORKSPACES.READ_ONLY_BANNER}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase"
      >
        {UI_COPY.WORKSPACES.READ_ONLY_BADGE}
      </Badge>
    </div>
  );
}
