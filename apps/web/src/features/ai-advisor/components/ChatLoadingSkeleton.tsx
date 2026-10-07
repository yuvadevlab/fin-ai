"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/ChatLoadingSkeleton.tsx
 * @description Non-intrusive loading placeholder rendered exclusively on cold conversation loads.
 * @module @finai/web/features/ai-advisor/components/ChatLoadingSkeleton
 */

import { cn } from "@finai/ui";
import { UI_COPY } from "@/lib";

/** Props configuration for the {@link ChatLoadingSkeleton} component */
export interface ChatLoadingSkeletonProps {
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Pulsing skeleton placeholder displayed when performing a cold hydrate on a conversation thread.
 * Only rendered when no messages are present in cache to avoid screen flickering during navigation.
 */
export function ChatLoadingSkeleton({ className }: ChatLoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-6 py-4", className)}
      role="status"
      aria-label={UI_COPY.ADVISOR.SKELETON.STATUS_LABEL}
    >
      {/* Turn 1: User inquiry skeleton */}
      <div className="flex flex-row-reverse gap-3">
        <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
        <div className="bg-muted/70 h-10 w-48 animate-pulse rounded-2xl" />
      </div>

      {/* Turn 1: Assistant response prose skeleton */}
      <div className="flex gap-3">
        <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
        <div className="max-w-xl flex-1 space-y-2.5">
          <div className="bg-muted/70 h-4 w-3/4 animate-pulse rounded-md" />
          <div className="bg-muted/60 h-4 w-5/6 animate-pulse rounded-md" />
          <div className="bg-muted/50 h-4 w-1/2 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Turn 2: Follow-up user message skeleton */}
      <div className="flex flex-row-reverse gap-3 pt-2">
        <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
        <div className="bg-muted/70 h-10 w-64 animate-pulse rounded-2xl" />
      </div>

      {/* Turn 2: Assistant second turn skeleton */}
      <div className="flex gap-3">
        <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
        <div className="max-w-lg flex-1 space-y-2.5">
          <div className="bg-muted/70 h-4 w-4/5 animate-pulse rounded-md" />
          <div className="bg-muted/50 h-4 w-2/3 animate-pulse rounded-md" />
        </div>
      </div>
      <span className="sr-only">{UI_COPY.ADVISOR.SKELETON.SR_TEXT}</span>
    </div>
  );
}
