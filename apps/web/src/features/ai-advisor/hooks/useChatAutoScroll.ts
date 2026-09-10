"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isNearBottom } from "../utils/scrollPolicy";

/**
 * Chat auto-scroll policy hook (ChatGPT/Claude-style behavior).
 *
 * State model:
 *   - autoScrollRef (a REF, not state): "the user wants to follow the
 *     bottom". Derived purely from the scroll container's real position —
 *     user at bottom ⇒ enabled, user scrolled away ⇒ disabled. A ref because
 *     scroll events fire far more often than React should re-render, and the
 *     ResizeObserver hot path must not touch state.
 *   - isAtBottom (state): mirrors autoScrollRef but only for rendering the
 *     "Jump to latest" chip. setState bails out on identical values, so
 *     scrolling itself does not re-render.
 *
 * How streaming interacts with scrolling:
 *   SSE chunk → message state update → React render → DOM grows
 *     → ResizeObserver fires → IF autoScroll enabled, pin to bottom
 *       (instant `scrollTop = scrollHeight`, never animated); ELSE no-op —
 *       the browser naturally preserves the user's viewport.
 *
 * Why a ResizeObserver instead of an effect on [messages]: the observer
 * fires on CONTENT HEIGHT CHANGES, which is the actual thing we follow.
 * That covers markdown re-layout (paragraph → list → table) even when the
 * messages array identity changed for unrelated reasons, and it never runs
 * layout work when the user has scrolled away. Scroll writes never change
 * content height, so the observer cannot feed back into itself.
 *
 * No timers, no `scrollIntoView`, no smooth-scroll queues — the previous
 * per-token `scrollIntoView({ behavior: "smooth" })` was the cause of the
 * scroll jerk this hook replaces.
 */
export function useChatAutoScroll() {
  /** The single scrollable conversation element. */
  const containerRef = useRef<HTMLDivElement | null>(null);
  /** Content wrapper whose height changes as messages grow. */
  const contentRef = useRef<HTMLDivElement | null>(null);

  const autoScrollRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  /**
   * Pins the viewport to the bottom — but ONLY when the policy allows.
   * Instant positioning on purpose: smooth animation per chunk creates an
   * animation backlog and visible jitter during fast streaming.
   */
  const followBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el || !autoScrollRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  /**
   * Explicit jump (user action): re-enables auto-follow and pins to the
   * bottom immediately. Used by "Jump to latest" and when the user sends a
   * new message — the user's OWN action always wins over preserved position.
   */
  const scrollToBottom = useCallback(() => {
    autoScrollRef.current = true;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
  }, []);

  /**
   * Re-derives scroll intent from the container's real position. Attached as
   * the container's `onScroll` (React synthetic event — no manual listeners).
   * Reads the three layout values once per scroll event; writes nothing.
   */
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const near = isNearBottom(el.scrollHeight, el.scrollTop, el.clientHeight);
    autoScrollRef.current = near;
    // Identical-value setState is a no-op re-render-wise.
    setIsAtBottom(near);
  }, []);

  /**
   * Follow content growth (streamed tokens, markdown re-layout, container
   * resize) while the policy is enabled. Observing both elements is safe:
   * pinning changes scrollTop only, never content/container height.
   */
  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => followBottom());
    observer.observe(content);
    observer.observe(container);
    return () => observer.disconnect();
  }, [followBottom]);

  /**
   * Land at the latest message on first mount (e.g. returning to the page).
   * The user has not expressed any position preference yet, so the bottom is
   * always the right starting point.
   */
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return {
    containerRef,
    contentRef,
    /** Mirrors the policy — drives the "Jump to latest" chip visibility. */
    isAtBottom,
    /** Attach to the scroll container: `onScroll={scroll.handleScroll}`. */
    handleScroll,
    /** Policy-respecting pin (no-op when the user scrolled away). */
    followBottom,
    /** Force-enable auto-follow and pin (jump button / new user message). */
    scrollToBottom,
  };
}
