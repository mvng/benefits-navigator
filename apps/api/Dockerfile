# ── Base ──────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

# ── Dependencies ──────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/eligibility-engine/package.json ./packages/eligibility-engine/
RUN pnpm install --frozen-lockfile

# ── Development ───────────────────────────────────
FROM deps AS development
COPY . .
CMD ["pnpm", "--filter", "api", "dev"]

# ── Build ─────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter api build

# ── Production ────────────────────────────────────
FROM node:20-alpine AS production
RUN npm install -g pnpm@9
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/main"]
