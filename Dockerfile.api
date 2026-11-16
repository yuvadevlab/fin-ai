# syntax=docker/dockerfile:1
# ==============================================================================
# FinAI Backend API — Production Dockerfile
# Optimized for Google Cloud Run, Render, Koyeb, and self-hosted Docker
# Author: yuva.devlab@gmail.com
# ==============================================================================

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy root workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.json ./

# Copy all package manifests and prisma schema across the workspace
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/prompts/package.json ./packages/prompts/
COPY packages/validation/package.json ./packages/validation/
COPY packages/finance-engine/package.json ./packages/finance-engine/
COPY packages/ai-engine/package.json ./packages/ai-engine/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app ./
COPY packages ./packages
COPY apps/api ./apps/api

# Generate Prisma client for linux-musl
RUN pnpm db:generate

# Build the API and all internal workspace dependencies
RUN pnpm --filter @finai/api... build

# ─── Stage 3: Production Runner ───────────────────────────────────────────────
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built workspace output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

# Ensure correct permissions
RUN chown -R nestjs:nodejs /app

USER nestjs
WORKDIR /app/apps/api

EXPOSE 4001

CMD ["node", "dist/main.js"]
