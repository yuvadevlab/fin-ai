# Contributing to FinAI

Thank you for your interest in contributing to FinAI! This document outlines our development workflows, quality gates, and code conventions to ensure consistent, high-standard software engineering across the monorepo.

---

## 1. Code of Conduct

We are committed to providing a professional, respectful, and inclusive environment. Please ensure all interactions and code contributions uphold these values.

---

## 2. Monorepo Setup & Prerequisites

- **Node.js:** `>= 20.x`
- **Package Manager:** `pnpm >= 9.x`
- **Database:** PostgreSQL `>= 15`
- **Local AI:** Ollama running locally on `http://localhost:11434` (optional for local LLM features)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yuvadevlab/fin-ai.git
cd fin-ai

# Install all workspace dependencies
pnpm install

# Initialize environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

---

## 3. Branching & Commit Conventions

### Branch Strategy

- `main`: Production release branch. Strictly protected.
- `feat/<topic>`: New features or domain additions.
- `fix/<topic>`: Bug fixes and issue patches.
- `chore/<topic>`: Tooling, dependency updates, and maintenance.

### Conventional Commits

All commit messages must adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Allowed Types:**

- `feat`: A new feature for users or packages.
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `docs`: Documentation changes only.
- `chore`: Build tasks, auxiliary tools, or dependency updates.

**Examples:**

```bash
git commit -m "feat(advisor): add bulk confirmation transaction preview carousel"
git commit -m "fix(ui): restore missing side border accent utilities on stat cards"
```

_Note: Commit messages are automatically validated by `commitlint` via Husky git hooks._

---

## 4. Engineering Quality Gates

Before opening a pull request, verify that your changes pass all local quality checks:

```bash
# 1. Typecheck the entire monorepo
pnpm typecheck

# 2. Run linting and code formatting
pnpm lint

# 3. Run unit and integration tests
pnpm test

# 4. Verify build artifacts
pnpm build
```

---

## 5. Architectural Invariants

When contributing to FinAI, please adhere to our core engineering invariants:

1. **Zero Side-Effects in Finance Engine:** `@finai/finance-engine` is a pure mathematical library. It must never perform network I/O or mutate external state.
2. **Centralized Schemas:** All domain validation schemas must reside in `@finai/validation` using Zod `.safeParse()`.
3. **Design System Tokens Exclusively:** Use semantic platform tokens (`bg-card`, `bg-background`, `border-border`, `text-primary`, etc.) from `@finai/ui` instead of ad-hoc hex values.
4. **2-File Modal Pattern:** Interactive modal workflows must separate presentation (`<Entity>Form.tsx`) from orchestration/mutations (`<Entity>Dialog.tsx`).
5. **No Secret Commits:** Never commit `.env`, API keys, private certificates, or database credentials.

---

## 6. Questions & Support

For architecture questions, feature proposals, or contributor support, reach out to the core engineering team at **[yuva.devlab@gmail.com](mailto:yuva.devlab@gmail.com)**.
