# Yuva DevLab Design System — Master Implementation Document

> **Status: Phase 0 — AUDIT COMPLETE**
> This is the permanent source of truth for the entire design-system project.
> Update this document after every meaningful change so any session can resume exactly where the previous session stopped.

---

## Vision

Build a **production-grade, token-driven, Tailwind-integrated, themeable design platform** — the Yuva DevLab Design System — whose first canonical theme is the current FinAI visual language, and which can serve FinAI and every future Yuva DevLab web application.

This is not a component library. It is a **design language with architectural discipline** modelled after the structural maturity of Google Material Design, Shopify Polaris, and Microsoft Fluent — but with its own design identity.

---

## Goals

- Establish a canonical, layered design system: Tokens → Theme → Foundations → Primitives → Components → Patterns → Applications.
- Formalize the existing FinAI visual language into the **Yuva Core Theme** without altering FinAI's look.
- Make the design system Tailwind-integrated but Tailwind-independent conceptually.
- Publish stable `@yuva-devlab/*` packages consumable by FinAI and future applications.
- Enable future applications to inherit the Yuva Core Theme without copying FinAI CSS.
- Enable future themes without rewriting components.

---

## Non-Goals

- Do NOT migrate FinAI away from Tailwind CSS.
- Do NOT introduce CSS Modules, styled-components, or Emotion into FinAI.
- Do NOT make the design system Tailwind-specific (Tailwind is the tooling layer, not the design layer).
- Do NOT break the current FinAI visual identity.
- Do NOT create per-component packages (`@yuva-devlab/button`, etc.).
- Do NOT create unnecessary abstractions or packages.
- Do NOT encode FinAI business logic into the design system.

---

## Current Architecture — Audit Findings (Phase 0)

### Design System Repository (`../design-system`)

**Location:** `/Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/design-system`
**Package Manager:** pnpm 10.11.0
**Build orchestration:** Turborepo 2.6.1
**Tooling:** Vite 7.x, TypeScript 5.9.x, Vanilla Extract, Radix UI, Storybook 10.x

#### Current Package Inventory

| Package                             | npm Name                         | Version | Status    |
| ----------------------------------- | -------------------------------- | ------- | --------- |
| `packages/colors`                   | `@yuva-devlab/colors`            | 0.1.2   | PUBLISHED |
| `packages/tokens`                   | `@yuva-devlab/tokens`            | 0.1.2   | PUBLISHED |
| `packages/primitives`               | `@yuva-devlab/primitives`        | 0.2.0   | PUBLISHED |
| `packages/ui`                       | `@yuva-devlab/ui`                | 0.2.0   | PUBLISHED |
| `packages/cli`                      | `@yuva-devlab/cli`               | 0.2.1   | PUBLISHED |
| `packages/config/eslint-config`     | `@yuva-devlab/eslint-config`     | —       | INTERNAL  |
| `packages/config/prettier-config`   | `@yuva-devlab/prettier-config`   | —       | INTERNAL  |
| `packages/config/typescript-config` | `@yuva-devlab/typescript-config` | —       | INTERNAL  |

#### Current App Inventory

| App               | Purpose                 | Status                                                   |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| `apps/docs`       | Storybook documentation | Minimal — one story (Button)                             |
| `apps/playground` | Vite React sandbox      | Minimal demos for Button, Form, Input, Layout, Selection |

#### What Is Good (Keep)

1. **`@yuva-devlab/colors`** — HSL-based palette generator. 10-shade tonal palettes from seed hex. Clean, purpose-built. ✅

2. **`@yuva-devlab/tokens`** — Excellent token architecture using Vanilla Extract `createGlobalThemeContract`. Covers:
   - Tonal palettes (MD3-style 13-stop per color, from 6 seeds: primary `#3e6a4d`, secondary `#516350`, tertiary `#3b6470`, error `#ba1a1a`, neutral `#5e615b`, neutralVariant `#5d6259`)
   - Semantic color contract (`brand.*`, `text.*`, `bg.*`, `border.*`, `interaction.*`)
   - Light + Dark themes
   - Typography: fonts (Inter), fontSizes (xs–6xl), fontWeights, lineHeights, letterSpacing
   - Spacing (2xs–5xl, 4px base), Radii (none–full), Shadows (xs–2xl + inner + focus)
   - Transitions (duration + easing), Z-index (9 semantic levels), Breakpoints (xs–2xl)
   - CSS variable prefix: `yd-color-*` ✅

3. **`@yuva-devlab/primitives`** — Correct headless layer using Radix UI. Covers: Button, Input, NumberInput, Textarea, Select, Checkbox, Radio, Switch, Slider, Form, Image, Box, Typography. ✅

4. **`@yuva-devlab/ui`** — Styled components layer (Vanilla Extract), consuming tokens + primitives. Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, Form, Image, Divider, Typography, Layout (Box, Flex, Grid, Container, Stack, semantic HTML). ✅

5. **`@yuva-devlab/cli`** — Component scaffolding tool (`yuva` bin). ✅

6. **Release tooling** — Changesets configured, 3 releases in history. ✅

7. **Git discipline** — Husky + commitlint with conventional commits. ✅

#### What Is Missing or Weak

1. **No `@yuva-devlab/tailwind` package** — No Tailwind 4 preset. FinAI cannot consume Yuva tokens.

2. **Token color contract mismatch** — Design system: `yd-color-*` CSS variables. FinAI: `--primary`, `--background`, `--foreground` OKLCH-based variables. No bridge exists.

3. **No Tailwind-styled component layer** — `@yuva-devlab/ui` uses Vanilla Extract. FinAI cannot use these components without adding VE to its build.

4. **Missing components** — Card, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Tabs, Accordion, Sheet, Toast, Badge, Avatar, Progress, Spinner, Skeleton, EmptyState, Table, Pagination.

5. **Storybook minimal** — Only one story (Button). No documentation for Typography, Layout, Form.

6. **No accessibility tests** — No `vitest-axe` in design system (only in `@finai/ui`).

7. **No icon system** — FinAI uses `lucide-react` directly. No strategy documented.

8. **Button API divergence** — Design system Button: 9+ variants (default, primary, ghost, link, elevated, filled, tonal, outlined, text, secondary, tertiary). FinAI Button: 6 variants (default, destructive, outline, secondary, ghost, link). Not compatible drop-ins.

9. **`@yuva-devlab/tokens` exports no plain JSON** — Cannot reference token values in JavaScript without the VE runtime.

---

### FinAI Repository Audit

**Location:** `/Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/finai`
**Package Manager:** pnpm
**Frontend:** Next.js 15.x (App Router)
**CSS Framework:** **Tailwind CSS 4.x** (CSS-first, no `tailwind.config.js`)
**Component package:** `@finai/ui` (private, workspace)

#### FinAI Visual Language — Yuva Core Theme Seed

**Color palette (OKLCH-based):**

| Role               | Light Mode                                        | Dark Mode                                |
| ------------------ | ------------------------------------------------- | ---------------------------------------- |
| Background         | `oklch(0.985 0.001 247)` — off-white blue-gray    | `oklch(0.16 0.015 260)` — deep blue-gray |
| Foreground         | `oklch(0.21 0.02 260)` — near-black               | `oklch(0.97 0.003 260)` — near-white     |
| Card               | `oklch(1 0 0)` — pure white                       | `oklch(0.2 0.015 260)` — elevated dark   |
| **Primary**        | **`oklch(0.63 0.14 156)` — emerald/forest green** | `oklch(0.7 0.15 156)` — lighter green    |
| Primary Foreground | `oklch(0.99 0.005 150)` — near white              | `oklch(0.15 0.02 260)` — near black      |
| Secondary          | `oklch(0.965 0.003 260)` — light gray             | `oklch(0.25 0.015 260)` — dark gray      |
| Muted Foreground   | `oklch(0.52 0.015 260)` — medium gray             | `oklch(0.7 0.01 260)` — lighter gray     |
| Accent             | `oklch(0.95 0.03 156)` — light green tint         | `oklch(0.3 0.05 156)` — dark green tint  |
| Destructive        | `oklch(0.6 0.22 25)` — red-orange                 | `oklch(0.65 0.2 25)` — lighter red       |
| Border             | `oklch(0.92 0.005 260)` — very light gray         | `oklch(1 0 0 / 8%)` — white 8% alpha     |

**Typography:** Inter (sans), `-apple-system` fallback chain
**Base radius:** `0.75rem` (12px) — moderately rounded
**Design language summary:** Emerald/forest green primary, warm blue-gray neutrals, OKLCH-modern, 12px radius, clean dark mode (deep blue-gray, not pure black). Trust-inspiring, calm, financial wellness aesthetic.

#### FinAI Tailwind Configuration

- **Tailwind 4.x (CSS-first)** — configuration entirely in `apps/web/src/app/globals.css`
- `@import "tailwindcss"` + `@theme inline { ... }` mapping CSS variables to Tailwind utilities
- `:root { ... }` and `.dark { ... }` blocks with OKLCH semantic CSS variables
- No `tailwind.config.js` — this is the modern Tailwind 4 approach

#### FinAI Arbitrary Tailwind Value Audit

| Value                        | Count   | Classification                                             |
| ---------------------------- | ------- | ---------------------------------------------------------- |
| `[11px]`                     | 26      | One-off fine-grained type — acceptable, or add `2xs` token |
| `[10px]`                     | 21      | One-off fine-grained type — acceptable                     |
| `[9px]`, `[13px]`, `[85vh]`… | <5 each | One-off layout — acceptable                                |

**Assessment:** No repeated semantic color arbitrary values found. All colors properly use CSS variables. Arbitrary values are minor layout/fine-tuning. No urgent remediation needed.

#### FinAI `@finai/ui` Package

Private, workspace-local, not published.

_Primitives (Radix + CVA + Tailwind):_ Button, Input, Progress, Badge, Avatar, Select, Calendar, DatePicker, SearchableSelect, Dialog, Sheet, Popover, Label, Separator, Skeleton, Switch, Tooltip, Card, AlertDialog, Toaster (Sonner), DropdownMenu, Toggle, Table, RadioGroup

_Layout:_ AppShell, Sidebar, TopBar, DashboardTabs, SidebarItem, SidebarAiCard

_Domain components (FinAI-specific):_ StatCard, KPIGrid, MiniStat, AIInsightCard, DataTable, Pagination, MoneyDisplay, MaskedValue, ScoreGauge, FinAILogo, StatusBadge, TransactionTypeBadge, ConfirmDialog, ActivityStep, ConfirmationCard, MarkdownContent, ChartCard, FormDialog, Charts (Recharts wrappers)

#### FinAI Uses of `@yuva-devlab/*`

**Currently zero.** FinAI and the design system are completely independent today.

---

## Architecture Problems Identified

1. **Parallel component systems** — `@yuva-devlab/ui` and `@finai/ui` both implement Button, Input, Select, Checkbox, Radio, Switch, Textarea, Form with divergent APIs and styling mechanisms.

2. **Styling mechanism incompatibility** — `@yuva-devlab/ui` uses Vanilla Extract. `@finai/ui` uses Tailwind 4 + CVA. FinAI cannot adopt `@yuva-devlab/ui` components without adding VE to its build.

3. **Token system incompatibility** — `@yuva-devlab/tokens` emits `yd-color-*` variables. FinAI's Tailwind 4 uses `--primary`, `--background`, etc. No bridge exists today.

4. **Color encoding divergence** — Design system uses HEX tonal palettes; FinAI uses OKLCH. The visual outputs are close (both center on the same forest green hue) but not mathematically identical.

5. **No `@yuva-devlab/tailwind` package** — The critical missing bridge.

6. **`@finai/ui` mixes generic and domain components** — Sidebar, AppShell are FinAI-specific. Table, Badge, Card are generic. MoneyDisplay, ScoreGauge are FinAI-domain. Boundary is not enforced by package structure.

7. **Storybook minimal** — Will block documentation quality goals.

8. **No a11y test infrastructure in design system** — Only in FinAI.

---

## Target Architecture

```
                         YUVA DEVLAB
                              │
                      DESIGN LANGUAGE
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
    @yuva-devlab/tokens               @yuva-devlab/colors
    (Token Contract,                   (Palette Generation)
     CSS Variables,
     Light/Dark Themes)
            │
            ▼
   @yuva-devlab/tailwind
   (Tailwind 4 preset:
    CSS variable bridge,
    semantic utilities)
            │
    ┌───────┴────────┐
    │                │
@yuva-devlab/primitives  @yuva-devlab/utils
(Radix headless,          (cn, formatters)
 behavior layer)
    │
    ▼
@yuva-devlab/components
(Tailwind-styled components:
 CVA variants, tokens)
    │
    ▼
  PATTERNS
    │
  ┌─┴─┐
  │   │
FinAI Future Apps
```

**Styling flow:**

```
Yuva Token Contract → CSS Custom Properties → Tailwind @theme → Semantic utilities → Components → Apps
```

**Theme flow:**

```
Theme Contract
      │
  ┌───┴───┐
  │       │
Yuva Core  Future Theme
  │
┌─┴─┐
│   │
Light Dark
```

---

## Package Architecture (Final)

| Package                   | Purpose                          | Action                               | Priority |
| ------------------------- | -------------------------------- | ------------------------------------ | -------- |
| `@yuva-devlab/colors`     | HSL palette generation           | KEEP                                 | —        |
| `@yuva-devlab/tokens`     | Token contract + Yuva Core Theme | REFACTOR (add control/icon tokens)   | P1       |
| `@yuva-devlab/tailwind`   | Tailwind 4 preset                | **CREATE**                           | P1       |
| `@yuva-devlab/primitives` | Headless Radix behavior          | KEEP                                 | —        |
| `@yuva-devlab/utils`      | Shared utilities (cn, etc.)      | **CREATE**                           | P2       |
| `@yuva-devlab/hooks`      | Shared React hooks               | **CREATE**                           | P2       |
| `@yuva-devlab/components` | Tailwind-styled components       | **CREATE**                           | P2       |
| `@yuva-devlab/ui`         | Existing VE-styled components    | DEPRECATE (after @components stable) | P3       |
| `@yuva-devlab/icons`      | Icon strategy                    | DEFERRED                             | —        |
| `@yuva-devlab/cli`        | Scaffolding tool                 | KEEP                                 | —        |
| Config packages           | ESLint/Prettier/TSConfig         | KEEP                                 | —        |

### Package Dependency Rules (Hard)

```
colors        → no @yuva-devlab/* deps
tokens        → @yuva-devlab/colors only
tailwind      → @yuva-devlab/tokens only; no React
primitives    → Radix UI only; no style deps
utils         → no @yuva-devlab/* deps
hooks         → @yuva-devlab/utils only
components    → primitives, tokens, utils, hooks
Applications  → any published @yuva-devlab/*
```

---

## Token Architecture

### Layer 1 — Primitive Tokens (Tonal Palettes)

From `@yuva-devlab/colors` via seed generation:

```
palettes.primary.{0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100}
palettes.neutral.*
palettes.neutralVariant.*
palettes.error.*
```

**Yuva Core Theme seeds** (verified against FinAI OKLCH primary):

- primary: `#3e6a4d` (maps to ~oklch 0.63 0.14 156 — forest green)
- secondary: `#516350`
- tertiary: `#3b6470`
- error: `#ba1a1a`
- neutral: `#5e615b`
- neutralVariant: `#5d6259`

### Layer 2 — Semantic Tokens (already implemented in `@yuva-devlab/tokens`)

```
colors.brand.primary.{main, onMain, container, onContainer, hover, active, subtle}
colors.brand.{secondary, tertiary, danger, success, warning, info}.*
colors.text.{primary, secondary, tertiary, disabled, onPrimary, onColor, inverse}
colors.bg.{body, surface, surfaceHover, surfaceActive, surfaceRaised, surfaceOverlay, canvas, subtle, disabled}
colors.border.{subtle, default, strong, interactive, disabled}
colors.interaction.{focusRing, overlay}
```

### Missing Tokens to Add

| Token                             | Category         | Source                           |
| --------------------------------- | ---------------- | -------------------------------- |
| `control.height.{xs,sm,md,lg,xl}` | Component sizing | FinAI `--control-height-*`       |
| `icon.size.{xs,sm,md,lg,xl}`      | Icon sizing      | FinAI `--icon-*`                 |
| `fontSize.2xs` (~10–11px)         | Typography       | FinAI `[11px]`/`[10px]` patterns |
| Sidebar color channel             | Color            | FinAI-specific, stays in FinAI   |

### CSS Variable Export

Design system emits: `--yd-color-primary`, `--yd-radius-lg`, etc.
`@yuva-devlab/tailwind` preset will re-map these to Tailwind conventions:

```css
@theme inline {
  --color-primary: var(--yd-color-primary);
  --color-primary-foreground: var(--yd-color-on-primary);
  --color-background: var(--yd-color-bg-body);
  --color-foreground: var(--yd-color-text-primary);
  --color-muted: var(--yd-color-bg-canvas);
  --color-muted-foreground: var(--yd-color-text-secondary);
  --color-border: var(--yd-color-border-default);
  --color-ring: var(--yd-color-focus-ring);
  --radius-lg: var(--yd-radius-lg);
  /* ... full mapping ... */
}
```

---

## Theme Architecture

### Theme Contract

Components reference semantic tokens only. They never reference a specific theme name or hardcoded value.

```
@yuva-devlab/tokens: createGlobalThemeContract(...)
        ↓
Yuva Core Theme: createGlobalTheme(":root", ...) [light]
        ↓
Dark override: createTheme(...) applied to .dark class
```

### Yuva Core Theme

Already implemented in `@yuva-devlab/tokens/src/themes.css.ts`. Light + dark both implemented. Minor refinements needed:

1. Visual parity check against FinAI OKLCH values
2. Add control height + icon size tokens
3. Generate Tailwind 4 compatible CSS export

---

## Tailwind Integration Strategy (ADR-003)

### Problem

FinAI is Tailwind 4. It cannot import Vanilla Extract CSS sources.

### Solution — `@yuva-devlab/tailwind` Package

A CSS preset file (`preset.css`) that:

1. `@import "@yuva-devlab/tokens/tokens.css"` — loads the `yd-color-*` CSS variables
2. Declares `@theme inline { ... }` mapping Yuva variable names to Tailwind-conventional names

FinAI's `globals.css` changes from:

```css
:root {
  --primary: oklch(0.63 0.14 156);
  ...
}
```

to:

```css
@import "@yuva-devlab/tailwind/preset.css";
/* Yuva Core colors are now available as bg-primary, text-foreground, etc. */
```

FinAI layout-specific tokens (`--header-height`, `--sidebar-width`, etc.) STAY in FinAI's `globals.css`.

### Applications Continue Using

```tsx
<div className="bg-background text-foreground border-border">
```

But values now come from Yuva tokens — not FinAI's manual OKLCH declarations.

---

## Component Architecture

### Styling Decision for `@yuva-devlab/components` (ADR-005)

**Tailwind utility classes + CVA** — not Vanilla Extract.

**Rationale:**

- FinAI is Tailwind 4. VE components cannot be adopted without adding VE to FinAI's build.
- Tailwind utilities compile to plain CSS. Zero consumer runtime dependency.
- `@yuva-devlab/ui` (VE-based) is preserved for backward compatibility. Not deprecated yet.
- A new `@yuva-devlab/components` package is created for the Tailwind-based layer.

### API Conventions

| Prop           | Convention | Values                                         |
| -------------- | ---------- | ---------------------------------------------- |
| Visual variant | `variant`  | `"primary"`, `"ghost"`, `"outline"`, `"link"`  |
| Size           | `size`     | `"sm"`, `"md"`, `"lg"`                         |
| Semantic tone  | `tone`     | `"success"`, `"danger"`, `"warning"`, `"info"` |
| Polymorphic    | `asChild`  | boolean (Radix Slot)                           |
| Density        | `density`  | `"compact"`, `"normal"`                        |

### Composition Pattern

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

## Component Classification Matrix

### From `@yuva-devlab/ui` (Vanilla Extract based)

| Component                                                                           | Action                          | Target                    |
| ----------------------------------------------------------------------------------- | ------------------------------- | ------------------------- |
| Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, Form | REFACTOR in Tailwind            | `@yuva-devlab/components` |
| Typography, Box, Flex, Grid, Container, Stack, Semantic HTML                        | REFACTOR in Tailwind            | `@yuva-devlab/components` |
| Image, Divider                                                                      | KEEP (re-implement in Tailwind) | `@yuva-devlab/components` |

### From `@finai/ui` (Generic components)

| Component                                                  | Action                            |
| ---------------------------------------------------------- | --------------------------------- |
| Card, Badge, Avatar, Progress, Skeleton                    | MOVE to `@yuva-devlab/components` |
| Dialog, AlertDialog, Sheet, Popover, Tooltip, DropdownMenu | MOVE to `@yuva-devlab/components` |
| Table, Label, Separator                                    | MOVE to `@yuva-devlab/components` |
| Pagination, SearchBar, FilterChips, LoadingState           | MOVE to `@yuva-devlab/components` |
| ConfirmDialog, MarkdownContent, ActivityStep, FormDialog   | MOVE to `@yuva-devlab/components` |

### From `@finai/ui` (FinAI-specific — KEEP OUTSIDE)

| Component                                    | Reason                              |
| -------------------------------------------- | ----------------------------------- |
| AppShell, Sidebar, TopBar, DashboardTabs     | FinAI application layout            |
| StatCard, KPIGrid, MiniStat, AIInsightCard   | FinAI domain display                |
| MoneyDisplay, MaskedValue, ScoreGauge        | FinAI finance domain                |
| FinAILogo, StatusBadge, TransactionTypeBadge | FinAI branding/domain               |
| AISuggestionsDialog, ConfirmationCard        | FinAI AI agent domain               |
| Calendar, DatePicker, SearchableSelect       | FinAI-specific date/search patterns |
| DataTable (with FinAI column schema)         | FinAI domain                        |
| Charts (Recharts wrappers)                   | FinAI-specific Recharts config      |
| ChartCard, ChartCard, ProgressCard           | FinAI domain display                |
| Toaster (Sonner), Toggle                     | FinAI-specific integration          |

### New Components to Create in `@yuva-devlab/components`

Heading, Alert/Banner, Tabs, Accordion, Spinner, EmptyState, ErrorState

---

## Accessibility Standards

**Target:** WCAG 2.2 AA

Every interactive component must have:

- Semantic HTML + correct ARIA roles
- Keyboard navigation (Tab, Enter/Space, Arrow keys, Escape)
- `focus-visible` indicator (≥3:1 contrast, uses `--yd-color-focus-ring`)
- `aria-invalid` + `aria-describedby` for error states
- `aria-busy` for loading states
- `disabled` attribute + visual disabled state
- Touch target ≥ 44×44px
- `@media (prefers-reduced-motion: no-preference)` wrapping all animations

**Testing:** `vitest-axe` for all interactive components. Storybook a11y addon.

---

## Responsive Standards

```
xs: 0px    | sm: 640px  | md: 768px
lg: 1024px | xl: 1280px | 2xl: 1536px
```

No fixed pixel widths that break at smaller screens. Sheet/Drawer adapt for mobile. No ad-hoc breakpoints in components — always use the token scale.

---

## Motion Standards

```
Duration:  instant(0ms), fast(100ms), normal(200ms), slow(300ms), slower(500ms)
Easing:    standard(0.4,0,0.2,1), emphasized(0.2,0,0,1), decelerate, accelerate, linear
```

All animations wrapped in `@media (prefers-reduced-motion: no-preference)`.

---

## Styling Standards

- `@yuva-devlab/components`: Tailwind utilities + CVA. No VE.
- `@yuva-devlab/ui` (existing): Vanilla Extract. Preserved for backward compatibility.
- `@finai/ui`: Tailwind + Radix. Status quo. Do not change.
- No `styled-components`, Emotion, or CSS Modules anywhere in design system.
- `cn()` from `@yuva-devlab/utils` (clsx + tailwind-merge) for class composition.
- No inline `style={}` with hardcoded values — always reference tokens.

---

## API Standards

```tsx
// Correct
<Button variant="primary" size="md" asChild><Link href="/">Go</Link></Button>
<Card><Card.Header><Card.Title>Hello</Card.Title></Card.Header></Card>
import { Button, Card } from "@yuva-devlab/components";

// Incorrect
<PrimaryButton />                                    // wrong abstraction
<Button kind="filled" />                             // wrong prop name
import Button from "@yuva-devlab/components/src/Button"; // no deep imports
```

---

## Testing Strategy

| Layer         | Framework                       | Target                       |
| ------------- | ------------------------------- | ---------------------------- |
| Unit          | Vitest                          | Token math, color generation |
| Component     | Vitest + @testing-library/react | All public components        |
| Accessibility | vitest-axe                      | All interactive components   |
| Visual        | Storybook (manual)              | All variants/states          |
| Integration   | FinAI E2E (Playwright)          | End-to-end after migration   |

---

## Documentation Strategy

- **Storybook** (`apps/docs`) is the component documentation system.
- Every public component must document: purpose, API, all variants, all sizes, all states, accessible usage.
- `DESIGN-SYSTEM-IMPLEMENTATION.md` is the engineering source of truth (this file).

---

## Versioning Strategy

- Semantic Versioning (PATCH/MINOR/MAJOR)
- **Changesets** for all releases (already configured)
- Breaking changes → MAJOR bump + migration notes
- All `@yuva-devlab/*` packages move in sync where possible

---

## Publishing Strategy

```
pnpm validate → pnpm changeset → pnpm version-packages → pnpm release
(format+lint+typecheck+build)
```

Registry: npm public (`@yuva-devlab` scope). Node ≥18 (ESM).

---

## Deprecation Strategy

1. Publish minor version with `@deprecated` JSDoc + `console.warn` in dev
2. Document replacement in CHANGELOG and README
3. Remove in next MAJOR (≥1 minor grace period)

> `@yuva-devlab/ui` v0.2.0 is published. Will be deprecated once `@yuva-devlab/components` is stable.

---

## FinAI Migration Strategy

**Principle:** Incremental, zero-downtime, visually preserving.

**Migration order (after design system stable):**

1. Import `@yuva-devlab/tailwind` preset → Remove FinAI OKLCH color variable declarations
2. Migrate primitives one-by-one (Button → Input → Badge → Card → ...)
3. Migrate layout foundations (Typography)
4. Migrate feedback components (Skeleton, LoadingState)
5. Migrate overlays (Dialog, Sheet, Popover, Tooltip)
6. Migrate data display (Table, Pagination)
7. Clean up duplicate `@finai/ui` implementations

**FinAI-specific components remain in `@finai/ui`** — Sidebar, AppShell, TopBar, domain display.

---

## Architecture Decisions (ADRs)

| ADR         | Decision                                                         | Status           |
| ----------- | ---------------------------------------------------------------- | ---------------- |
| **ADR-001** | Keep Vanilla Extract for `@yuva-devlab/tokens` contract          | DONE             |
| **ADR-002** | Runtime delivery via CSS Custom Properties                       | DONE             |
| **ADR-003** | Create `@yuva-devlab/tailwind` as Tailwind 4 CSS preset bridge   | DECIDED          |
| **ADR-004** | Cohesive packages; avoid per-component packages                  | DONE             |
| **ADR-005** | `@yuva-devlab/components` uses Tailwind/CVA, not VE              | DECIDED          |
| **ADR-006** | WCAG 2.2 AA via vitest-axe for all interactive components        | DECIDED          |
| **ADR-007** | FinAI stays on Tailwind; design system adapts                    | FIXED CONSTRAINT |
| **ADR-008** | Use Changesets for all releases                                  | DONE             |
| **ADR-009** | Zero FinAI business logic in design system                       | FIXED CONSTRAINT |
| **ADR-010** | Icon strategy: document Lucide convention; icon package deferred | DEFERRED         |

---

## Component Status Matrix

| Component                     | DS (`@yuva-devlab/ui`) | FinAI (`@finai/ui`) | Target                    | Status |
| ----------------------------- | ---------------------- | ------------------- | ------------------------- | ------ |
| Button                        | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Input                         | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Textarea                      | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Select                        | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Checkbox                      | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Radio                         | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Switch                        | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Slider                        | ✅ (VE)                | —                   | `@yuva-devlab/components` | TODO   |
| NumberInput                   | ✅ (VE)                | —                   | `@yuva-devlab/components` | TODO   |
| Form                          | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Typography                    | ✅ (VE)                | —                   | `@yuva-devlab/components` | TODO   |
| Box/Flex/Grid/Container/Stack | ✅ (VE)                | —                   | `@yuva-devlab/components` | TODO   |
| Card                          | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Badge                         | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Avatar                        | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Progress                      | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Skeleton                      | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Dialog                        | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| AlertDialog                   | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Sheet                         | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Popover                       | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Tooltip                       | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| DropdownMenu                  | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Table                         | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Label                         | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Separator/Divider             | ✅ (VE)                | ✅                  | `@yuva-devlab/components` | TODO   |
| Pagination                    | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| SearchBar                     | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| FilterChips                   | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| LoadingState/EmptyState       | —                      | ✅                  | `@yuva-devlab/components` | CREATE |
| ConfirmDialog                 | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| MarkdownContent               | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| ActivityStep                  | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| FormDialog                    | —                      | ✅                  | `@yuva-devlab/components` | TODO   |
| Heading                       | —                      | —                   | `@yuva-devlab/components` | CREATE |
| Alert/Banner                  | —                      | —                   | `@yuva-devlab/components` | CREATE |
| Tabs                          | —                      | —                   | `@yuva-devlab/components` | CREATE |
| Accordion                     | —                      | —                   | `@yuva-devlab/components` | CREATE |
| Spinner                       | —                      | —                   | `@yuva-devlab/components` | CREATE |

---

## Package Status Matrix

| Package                   | Action            | Priority | Status |
| ------------------------- | ----------------- | -------- | ------ |
| `@yuva-devlab/colors`     | KEEP              | —        | DONE   |
| `@yuva-devlab/tokens`     | REFACTOR          | P1       | TODO   |
| `@yuva-devlab/tailwind`   | CREATE            | P1       | TODO   |
| `@yuva-devlab/primitives` | KEEP              | —        | DONE   |
| `@yuva-devlab/utils`      | CREATE            | P2       | TODO   |
| `@yuva-devlab/hooks`      | CREATE            | P2       | TODO   |
| `@yuva-devlab/components` | CREATE            | P2       | TODO   |
| `@yuva-devlab/ui`         | DEPRECATE (later) | P3       | TODO   |
| `@yuva-devlab/cli`        | KEEP              | —        | DONE   |
| Config packages           | KEEP              | —        | DONE   |

---

## Implementation Phases

| Phase        | Name            | Status   | Key Deliverables                                                                               |
| ------------ | --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| **Phase 0**  | Audit           | **DONE** | This document, all audit findings, all ADRs                                                    |
| **Phase 1**  | Architecture    | TODO     | Package scaffolding, token gap additions, ADRs confirmed                                       |
| **Phase 2**  | Yuva Core Theme | TODO     | `@yuva-devlab/tailwind` preset, CSS variable bridge, parity verification                       |
| **Phase 3**  | Foundations     | TODO     | Typography, Spacing, Color, Radius, Elevation, Motion export                                   |
| **Phase 4**  | Primitives      | TODO     | Control heights + icon sizes in tokens, headless primitives verified                           |
| **Phase 5**  | Components      | TODO     | All components in status matrix in `@yuva-devlab/components`                                   |
| **Phase 6**  | Patterns        | TODO     | ConfirmDialog, FormDialog, ActivityStep, Alert, EmptyState                                     |
| **Phase 7**  | AI Patterns     | DEFERRED | StreamingMessage, ThinkingIndicator, AgentStatus                                               |
| **Phase 8**  | Quality         | TODO     | Full a11y tests, Storybook docs, visual validation                                             |
| **Phase 9**  | Publish         | TODO     | `@yuva-devlab/tailwind`, `@yuva-devlab/components`, `@yuva-devlab/utils`, `@yuva-devlab/hooks` |
| **Phase 10** | FinAI Migration | TODO     | FinAI imports Yuva packages, duplicates removed                                                |
| **Phase 11** | Cleanup         | TODO     | Deprecate `@yuva-devlab/ui`, remove dead code, final validation                                |

---

## Governance

### When does a component belong in the design system?

✅ Generic interaction pattern usable by any SaaS/productivity/financial app
✅ Required across 2+ applications
✅ Has clear domain-agnostic API
✅ Styled via Yuva tokens without business knowledge

❌ Contains FinAI domain terms (transactions, budgets, goals, health scores)
❌ Imports `@finai/*` packages
❌ Requires FinAI API shapes or domain types
❌ Only makes sense within FinAI context

### How are tokens added?

1. Identify the design decision
2. Determine layer (primitive vs semantic)
3. Add to `createGlobalThemeContract` in `@yuva-devlab/tokens`
4. Implement value in both light and dark themes
5. Update Tailwind bridge in `@yuva-devlab/tailwind`
6. Update this document

### API versioning

- New props/variants: MINOR
- New components: MINOR
- Renaming props (breaking): MAJOR
- Removing components: MAJOR (with deprecation period)

---

## Known Issues

1. **Color encoding mismatch** — HEX tonal vs FinAI OKLCH. Visual parity needs verification via Storybook in Phase 2.
2. **`@yuva-devlab/ui` v0.2.0 deprecation risk** — Requires careful MAJOR bump and changelog communication.
3. **FinAI control height tokens** (`--control-height-*`) are in `globals.css` but not yet in `@yuva-devlab/tokens`. Phase 4 task.
4. **Storybook version mismatch** — Design system uses v10; FinAI uses v8. Align in Phase 8.
5. **Sidebar dimensions** in FinAI (`--header-height`, `--sidebar-width`) are app-specific — must NOT enter the design system.

---

## Session Handoff

### Completed

- [x] Full audit of `../design-system` repository (all packages, source, config, changelogs)
- [x] Full audit of FinAI frontend (`apps/web`, `packages/ui`)
- [x] FinAI visual language extracted (primary color, typography, radius, spacing, dark mode)
- [x] Architecture problems identified and documented (8 problems)
- [x] Target architecture designed
- [x] Package architecture finalized (9 packages + deprecation plan)
- [x] Token architecture reviewed and gaps identified (control heights, icon sizes, `fontSize.2xs`)
- [x] Tailwind integration strategy (ADR-003) designed
- [x] Component classification matrix created (50+ components classified)
- [x] 10 Architecture Decisions documented (ADR-001 through ADR-010)
- [x] Implementation phases defined (Phase 0–11)
- [x] `DESIGN-SYSTEM-IMPLEMENTATION.md` written

### In Progress

Nothing currently in progress.

### Files Changed

- `design-system/DESIGN-SYSTEM-IMPLEMENTATION.md` [NEW]

### Packages Changed / Published

None in this session.

### Known Issues

See "Known Issues" section above.

### Blocked

Nothing blocked.

### Deferred

- AI patterns (Phase 7) — requires FinAI AI advisor pattern analysis.
- Icon package — Lucide directly is fine; dedicated icon layer is premature.

### Exact Next Step

**Phase 1, Step 1:** Create `packages/tailwind` in the design system.

This is the **critical path item** that unblocks FinAI integration (Phase 10) and all Tailwind-based component work (Phase 5). Without it, FinAI cannot consume any Yuva token.

Files to create:

```
design-system/packages/tailwind/package.json
design-system/packages/tailwind/src/preset.css      ← @theme inline bridge
design-system/packages/tailwind/src/index.ts        ← optional JS export
design-system/packages/tailwind/README.md
design-system/packages/tailwind/tsconfig.json
design-system/packages/tailwind/vite.config.ts      ← CSS-only build
```

**After Phase 1:** Phase 2 — Verify color parity (HEX tonal vs FinAI OKLCH) and publish `@yuva-devlab/tailwind@0.1.0`.
