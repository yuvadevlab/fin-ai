# ADR 0001: Pure Platform CSS Architecture with W3C Cascade Layers

## Status

Accepted

## Context

As the FinAI application evolved, styling was previously tightly coupled to build-time utility compiler toolchains. This introduced several engineering friction points:

1. Slower continuous integration and hot-module reload times due to continuous scanning of large monorepo ASTs.
2. Fragile CSS specificity conflicts between component libraries (`@finai/ui`), shared design system packages (`@yuva-devlab/ui`), and domain applications (`apps/web`).
3. Build-time toolchain deprecation risks and breaking changes across framework major versions.

## Decision

We adopted a **Pure Platform CSS Architecture** governed by modern W3C standards:

1. **W3C Cascade Layers (`@layer`):** Explicitly declare layer precedence to deterministically resolve specificity without `!important`:
   ```css
   @layer dl-reset, dl-tokens, dl-components, dl-layout, dl-utilities, dl-app;
   ```
2. **Canonical Design Tokens:** Root tokens define semantic colors (`--primary`, `--background`, `--card`, `--border`, `--destructive`) and typography in OKLCH color spaces.
3. **Encapsulated UI Packages:** `@finai/ui` exports pre-compiled stylesheets (`dist/ui.css`) and modular styles with clean semantic layers.

## Consequences

### Positive

- **Predictable Specificity:** Utilities (`dl-utilities`) reliably override component defaults (`dl-components`) without requiring `!important` or high-specificity hacks.
- **Zero Build-Time Compiler Overhead:** Fast development and sub-second production builds without CSS AST scanning steps.
- **Standards Compliant:** Native CSS recognized by modern browsers without proprietary vendor lock-in.

### Negative / Tradeoffs

- Requires deliberate curation of utility classes in the shared library rather than relying on arbitrary string generation.
- Developers must respect layer hierarchies and avoid unlayered overrides.
