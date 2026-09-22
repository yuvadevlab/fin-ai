import "@testing-library/jest-dom";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
expect.extend(matchers);
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// Mock MatchMedia (required for some Radix UI components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
