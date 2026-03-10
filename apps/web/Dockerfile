FROM node:20-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/eligibility-engine/package.json ./packages/eligibility-engine/
RUN pnpm install --frozen-lockfile

FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

FROM deps AS builder
COPY . .
RUN pnpm --filter web build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "apps/web/server.js"]
