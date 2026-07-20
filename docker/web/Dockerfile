# ==============================================================================
# Multi-stage Dockerfile for @finai/web (Next.js Frontend)
# Leverages Next.js output: "standalone" for minimal image size (~150MB)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image setup
# ------------------------------------------------------------------------------
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.13.0 --activate

RUN apk add --no-cache dumb-init

# ------------------------------------------------------------------------------
# Stage 2: Build Stage
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.json ./

# Copy all packages & web application
COPY packages ./packages
COPY apps/web ./apps/web

# Install all workspace dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Set environment variables for build phase
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build packages and Next.js web application
RUN pnpm --filter @finai/web... build

# ------------------------------------------------------------------------------
# Stage 3: Production Runner Stage
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user and group for container security hardening
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create public directory if it doesn't exist
RUN mkdir -p public

# Copy standalone build output, public assets, and static output
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

# Container Healthcheck (runs every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["/sbin/dumb-init", "--"]

# Launch Next.js standalone server
CMD ["node", "apps/web/server.js"]
