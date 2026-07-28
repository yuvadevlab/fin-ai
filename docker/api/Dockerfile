# ==============================================================================
# Multi-stage Dockerfile for @finai/api (NestJS API)
# Optimized for pnpm workspace monorepos and security best practices
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image setup
# ------------------------------------------------------------------------------
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

# Install libc6-compat & OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl libc6-compat dumb-init

# ------------------------------------------------------------------------------
# Stage 2: Dependencies & Build Stage
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy pnpm workspace definition files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.json ./

# Copy all workspace packages & applications
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies for the workspace
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma Client directly for @finai/api
RUN pnpm --filter @finai/api db:generate

# Build packages and NestJS API
RUN pnpm --filter @finai/api... build

# Deploy pruned production dependencies for @finai/api
RUN pnpm --filter @finai/api deploy --prod --legacy /app/pruned

# Copy Prisma schema & migrations folder into pruned directory for runtime migrations
RUN mkdir -p /app/pruned/prisma
RUN cp -R apps/api/prisma/* /app/pruned/prisma/ 2>/dev/null || true

# Copy entrypoint script for automated migration and seed (convert CRLF to LF for Windows compatibility)
COPY docker/api/entrypoint.sh /app/pruned/entrypoint.sh
RUN sed -i 's/\r$//' /app/pruned/entrypoint.sh && chmod +x /app/pruned/entrypoint.sh


# ------------------------------------------------------------------------------
# Stage 3: Production Runner Stage
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root system user and group for security hardening
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy pruned production application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/pruned ./

# Set ownership of workspace directory
USER nestjs

EXPOSE 4000

# Container Healthcheck (runs every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Use dumb-init and entrypoint script for signal handling & automatic migrations
ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]

# Start NestJS API runtime
CMD ["node", "dist/main.js"]

