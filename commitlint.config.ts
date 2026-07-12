import type { UserConfig } from "@commitlint/types";

/**
 * Commitlint Configuration — Yuva DevLab - FinAI
 *
 * Enforces the Conventional Commits specification:
 * https://www.conventionalcommits.org
 *
 * Format:
 *
 *   <type>(<scope>): <subject>
 *
 * Examples:
 *
 *   feat(ui): add reusable chart card component
 *   fix(api): handle expired JWT refresh token
 *   refactor(database): simplify prisma repository
 *   perf(web): reduce dashboard bundle size
 *   docs(workspace): update development guide
 *   chore(deps): upgrade next.js to latest version
 *
 * Breaking changes:
 *
 *   feat(api)!: remove legacy authentication endpoint
 *
 *   BREAKING CHANGE: Legacy /login endpoint has been removed.
 */

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // ─── Type ────────────────────────────────────────────────────────────────
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "style",
        "test",
        "docs",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],

    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // ─── Scope ────────────────────────────────────────────────────────────────
    // Scope is mandatory in this monorepo.
    // Prefer package/app/service names.
    "scope-empty": [2, "never"],

    "scope-case": [2, "always", "kebab-case"],

    "scope-enum": [
      1,
      "always",
      [
        // Applications
        "web",
        "mobile",
        "desktop",
        "docs",

        // Services
        "api",
        "database",
        "auth",
        "finance-engine",

        // Packages
        "ui",
        "features",
        "shared",
        "shared-types",
        "validation",
        "configs",

        // Infrastructure
        "workspace",
        "infra",
        "docker",
        "k8s",
        "ci",

        // Tooling
        "eslint",
        "prettier",
        "husky",
        "commitlint",
        "storybook",

        // Dependencies
        "deps",
      ],
    ],

    // ─── Subject ────────────────────────────────────────────────────────────────

    "subject-empty": [2, "never"],

    "subject-full-stop": [2, "never", "."],

    "subject-min-length": [2, "always", 8],

    "subject-max-length": [2, "always", 100],

    // ─── Header ────────────────────────────────────────────────────────────────

    "header-max-length": [2, "always", 100],

    // ─── Body ────────────────────────────────────────────────────────────────

    "body-leading-blank": [2, "always"],

    "body-max-line-length": [2, "always", 100],

    // ─── Footer ────────────────────────────────────────────────────────────────

    "footer-leading-blank": [2, "always"],

    "footer-max-line-length": [2, "always", 100],
  },
};

export default config;
