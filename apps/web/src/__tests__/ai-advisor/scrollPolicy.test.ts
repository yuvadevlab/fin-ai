import { describe, expect, it } from "vitest";
import {
  SCROLL_BOTTOM_THRESHOLD_PX,
  distanceFromBottom,
  isNearBottom,
} from "../../features/ai-advisor/utils/scrollPolicy";

describe("scrollPolicy", () => {
  describe("SCROLL_BOTTOM_THRESHOLD_PX", () => {
    it("is a reasonable threshold between 50 and 100", () => {
      expect(SCROLL_BOTTOM_THRESHOLD_PX).toBeGreaterThanOrEqual(50);
      expect(SCROLL_BOTTOM_THRESHOLD_PX).toBeLessThanOrEqual(100);
    });
  });

  describe("distanceFromBottom", () => {
    it("returns scrollHeight - scrollTop - clientHeight", () => {
      // scrollHeight=1000, scrollTop=200, clientHeight=500 → 1000-200-500=300
      expect(distanceFromBottom(1000, 200, 500)).toBe(300);
    });

    it("returns 0 when viewport is at the very bottom", () => {
      expect(distanceFromBottom(1000, 500, 500)).toBe(0);
    });

    it("returns a positive value when scrolled partway", () => {
      expect(distanceFromBottom(2000, 100, 800)).toBe(1100);
    });
  });

  describe("isNearBottom", () => {
    it("returns true when distance is 0 (exactly at bottom)", () => {
      expect(isNearBottom(1000, 500, 500)).toBe(true);
    });

    it("returns true when distance is within the default threshold", () => {
      // distance = 40, threshold = 80 → true
      expect(isNearBottom(1000, 460, 500)).toBe(true);
    });

    it("returns false when distance exceeds the default threshold", () => {
      // distance = 100, threshold = 80 → false
      expect(isNearBottom(1000, 400, 500)).toBe(false);
    });

    it("uses a custom threshold when provided", () => {
      // distance = 30, custom threshold = 20 → false
      expect(isNearBottom(1000, 470, 500, 20)).toBe(false);
      // distance = 30, custom threshold = 50 → true
      expect(isNearBottom(1000, 470, 500, 50)).toBe(true);
    });

    it("returns false when the user has scrolled far away", () => {
      expect(isNearBottom(10000, 0, 500)).toBe(false);
    });
  });
});
