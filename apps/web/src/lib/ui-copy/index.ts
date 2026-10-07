/**
 * @file apps/web/src/lib/ui-copy/index.ts
 * @description Centralized, modular UI copy dictionary catalog.
 * Eliminates raw string literals, hardcoded placeholders, and ad-hoc a11y texts in JSX.
 * @module @finai/web/lib/ui-copy
 */

import { COMMON_COPY } from "./common";
import { ADVISOR_COPY } from "./advisor";

export * from "./common";
export * from "./advisor";

/**
 * Universal, type-safe dictionary of user-facing UI text strings,
 * placeholders, accessibility labels, and action copy.
 */
export const UI_COPY = {
  COMMON: COMMON_COPY,
  ADVISOR: ADVISOR_COPY,
} as const;

export type UiCopyCatalog = typeof UI_COPY;
