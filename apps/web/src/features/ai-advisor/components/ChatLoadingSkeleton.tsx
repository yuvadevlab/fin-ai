"use client";

/**
 * @file apps/web/src/features/ai-advisor/components/ChatLoadingSkeleton.tsx
 * @description Non-intrusive loading placeholder rendered exclusively on cold conversation loads.
 * @module @fin-ai/web/features/ai-advisor/components/ChatLoadingSkeleton
 */

import { cn } from "@fin-ai/ui";
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
      className={cn("fn-chat-skeleton", className)}
      role="status"
      aria-label={UI_COPY.ADVISOR.SKELETON.STATUS_LABEL}
    >
      {/* Turn 1: User inquiry skeleton */}
      <div className="fn-chat-skeleton-row is-user">
        <div className="fn-chat-skeleton-avatar" />
        <div className="fn-chat-skeleton-user-bubble" />
      </div>

      {/* Turn 1: Assistant response prose skeleton */}
      <div className="fn-chat-skeleton-row">
        <div className="fn-chat-skeleton-avatar" />
        <div className="fn-chat-skeleton-body">
          <div className="fn-chat-skeleton-line is-width-75" />
          <div className="fn-chat-skeleton-line is-width-85" />
          <div className="fn-chat-skeleton-line is-width-50" />
        </div>
      </div>

      {/* Turn 2: Follow-up user message skeleton */}
      <div className="fn-chat-skeleton-row is-followup">
        <div className="fn-chat-skeleton-avatar" />
        <div className="fn-chat-skeleton-user-bubble is-long" />
      </div>

      {/* Turn 2: Assistant second turn skeleton */}
      <div className="fn-chat-skeleton-row">
        <div className="fn-chat-skeleton-avatar" />
        <div className="fn-chat-skeleton-body">
          <div className="fn-chat-skeleton-line is-width-80" />
          <div className="fn-chat-skeleton-line is-width-65" />
        </div>
      </div>
      <span className="sr-only">{UI_COPY.ADVISOR.SKELETON.SR_TEXT}</span>
    </div>
  );
}
