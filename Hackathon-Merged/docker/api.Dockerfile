# ============================================================================
# API Server Dockerfile
# Multi-stage build: install → build → production
# ============================================================================

# --- Stage 1: Install dependencies ---
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root files needed for pnpm install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy only package.json files for each workspace package (for caching)
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/securedocs-dashboard/package.json artifacts/securedocs-dashboard/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY scripts/package.json scripts/

# Install all dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile

# --- Stage 2: Build the API server ---
FROM deps AS builder
WORKDIR /app

# Copy source code
COPY artifacts/api-server/ artifacts/api-server/

# Build with esbuild (outputs to artifacts/api-server/dist/)
RUN cd artifacts/api-server && pnpm run build

# --- Stage 3: Production image ---
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all workspace package.json files
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/securedocs-dashboard/package.json artifacts/securedocs-dashboard/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY scripts/package.json scripts/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder
COPY --from=builder /app/artifacts/api-server/dist/ artifacts/api-server/dist/

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

WORKDIR /app/artifacts/api-server
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
