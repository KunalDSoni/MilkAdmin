# syntax=docker/dockerfile:1
#
# Moderns Milk Admin (Next.js) — production image (optional; Vercel needs none).
# BUILD CONTEXT MUST BE THE REPO ROOT:
#   docker build -f apps/web/Dockerfile -t moderns-milk-web .
#
# Set API_ORIGIN at runtime to the public API URL. The /bff proxy runs inside
# this Node server, so the browser stays same-origin (no CORS change needed).

# ---- build stage ----------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/database/package.json packages/database/
COPY packages/config/package.json packages/config/
RUN npm ci

COPY . .
# Builds @moderns-milk/contracts (dist) first, then the Next app (standalone).
RUN npx turbo run build --filter=@moderns-milk/web...

# ---- runtime stage --------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output already contains a minimal node_modules. With
# outputFileTracingRoot at the repo root, the server lives under apps/web.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
