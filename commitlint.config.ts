import type { UserConfig } from "@commitlint/types";

/**
 * Commitlint Configuration — Distributed Systems Lab
 *
 * Enforces the Conventional Commits specification (https://www.conventionalcommits.org).
 * All commit messages must follow the format:
 *
 *   <type>(<scope>): <subject>
 *
 * Examples:
 *   feat(auth): add JWT refresh token rotation
 *   fix(api-gateway): handle circuit breaker timeout edge case
 *   docs(packages): update @yuvadevlab/logger usage guide
 *   chore(deps): bump nx to 23.1.0
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // ─── Type ───────────────────────────────────────────────────────────────
    // Allowed commit types — strict, no extras accepted.
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Formatting, no logic change
        "refactor", // Code restructuring, no feature/fix
        "perf", // Performance improvement
        "test", // Adding or updating tests
        "build", // Build system or external dependencies
        "ci", // CI/CD configuration
        "chore", // Maintenance, tooling
        "revert", // Reverts a previous commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // ─── Scope ──────────────────────────────────────────────────────────────
    // Scope is required on all commits to identify affected component.
    // Use the package, service, or app name as the scope.
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "scope-enum": [
      1, // warn (not error) — scopes may expand as new services are added
      "always",
      [
        "packages", // Monorepo packages
        "apps", // Monorepo apps
        "web", // Web app
        "api", // API service
        "database", // Database service
        "features", // Features package
        "finance-engine", // Finance engine service
        "shared-types", // Shared types package
        "ui", // UI component library
        "validation", // Validation package
        "workspace", // Workspaces
        "ci", // CI/CD configuration
        "infra", // Infrastructure
        "configs", // Configuration files
        "husky", // Husky configuration
        "commitlint", // Commitlint configuration
      ],
    ],

    // ─── Subject ────────────────────────────────────────────────────────────
    "subject-empty": [2, "never"],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."], // No trailing period
    "subject-min-length": [2, "always", 10], // Force descriptive messages
    "subject-max-length": [2, "always", 100],

    // ─── Header ─────────────────────────────────────────────────────────────
    "header-max-length": [2, "always", 120],

    // ─── Body ───────────────────────────────────────────────────────────────
    "body-leading-blank": [2, "always"], // Blank line between header and body
    "body-max-line-length": [2, "always", 120],

    // ─── Footer ─────────────────────────────────────────────────────────────
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 120],
  },
};

export default config;
