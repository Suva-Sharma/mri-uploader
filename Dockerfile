# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app

# Build-time placeholders so Prisma / Stripe-dependent modules can load during docker build
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mri"
ARG STRIPE_SECRET_KEY="sk_test_placeholder"
ARG STRIPE_WEBHOOK_SECRET="whsec_placeholder"
ARG APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG EMAIL_MODE="console"
ARG MAX_UPLOAD_BYTES="5368709120"

ENV DATABASE_URL=${DATABASE_URL}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ENV APP_URL=${APP_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV EMAIL_MODE=${EMAIL_MODE}
ENV MAX_UPLOAD_BYTES=${MAX_UPLOAD_BYTES}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before build
RUN npx prisma generate

# Build Next.js standalone output
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATA_ROOT=/app/data
ENV NEXT_TELEMETRY_DISABLED=1

# Install tini for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user/group
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home nextjs

# Copy standalone runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma runtime artifacts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Prepare app directories and set ownership
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/data/tmp /app/data/cases \
  && chown -R nextjs:nodejs /app /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--", "docker-entrypoint.sh"]
CMD ["node", "server.js"]