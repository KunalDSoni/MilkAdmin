# syntax=docker/dockerfile:1
#
# Moderns Milk API (NestJS) — production image.
# BUILD CONTEXT MUST BE THE REPO ROOT (workspace deps live there):
#   docker build -f apps/api/Dockerfile -t moderns-milk-api .
#
# Generating the Prisma client in the same Debian base used at runtime keeps
# the query engine binary in sync, so no schema binaryTargets change is needed.
# The image keeps full node_modules so the Prisma CLI is available to run
# `migrate deploy` on boot — no backend package.json change required.

# ---- build stage ----------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install with the full workspace graph so npm can resolve "*" deps.
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/database/package.json packages/database/
COPY packages/config/package.json packages/config/
RUN npm ci

# Source, then build the API + its workspace deps. Turbo resolves topo order:
# contracts + database (runs `prisma generate`) -> api (`nest build`).
COPY . .
RUN npx turbo run build --filter=@moderns-milk/api...

# ---- runtime stage --------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# node_modules carries the generated Prisma client, query engine, and CLI.
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

USER nestjs
EXPOSE 4000

# Apply pending migrations on boot, then start the server. For zero-downtime
# setups, run `npx prisma migrate deploy` as a separate release step instead
# and set the CMD to just `node apps/api/dist/main.js`.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js"]
