#!/bin/sh
set -e

echo "🔄 Running automated database schema migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma || true

echo "🌱 Running automated initial database seed..."
npx prisma db seed --schema=prisma/schema.prisma 2>/dev/null || true

echo "⚡ Starting FinAI API server..."
exec "$@"
