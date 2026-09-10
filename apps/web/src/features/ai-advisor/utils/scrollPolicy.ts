/**
 * Pure scroll policy for the chat container (no React, no DOM access).
 *
 * The chat has exactly one scrollable element (the conversation panel in
 * `AiAdvisorPage`). Every scroll decision flows through these helpers so the
 * policy is unit-testable and the threshold lives in exactly one place.
 *
 * Core rule: automatic scrolling follows the user, never fights the user.
 * The user's distance from the bottom IS the user's intent.
 */

/**
 * How close (px) to the bottom counts as "at the bottom". A generous
 * threshold avoids pixel-perfect demands on both the user and the browser
 * (sub-pixel scroll positions, fractional scrollHeight, rounding).
 */
export const SCROLL_BOTTOM_THRESHOLD_PX = 80;

/** Distance between the viewport's bottom edge and the content's bottom. */
export function distanceFromBottom(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
): number {
  return scrollHeight - scrollTop - clientHeight;
}

/**
 * True when the user is at (or within the threshold of) the bottom.
 * This is the single source of truth for both:
 *   - whether new streamed content should auto-follow, and
 *   - whether the "Jump to latest" affordance should be hidden.
 */
export function isNearBottom(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  threshold: number = SCROLL_BOTTOM_THRESHOLD_PX,
): boolean {
  return distanceFromBottom(scrollHeight, scrollTop, clientHeight) <= threshold;
}
