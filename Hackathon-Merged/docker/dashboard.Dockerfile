# ============================================================================
# Dashboard Dockerfile
# Multi-stage build: install → build → serve with Nginx
# ============================================================================

# --- Stage 1: Install dependencies ---
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy package.json files for workspace packages
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/securedocs-dashboard/package.json artifacts/securedocs-dashboard/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY scripts/package.json scripts/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# --- Stage 2: Build the dashboard ---
FROM deps AS builder
WORKDIR /app

# Copy dashboard source code
COPY artifacts/securedocs-dashboard/ artifacts/securedocs-dashboard/

# Build with Vite (outputs to artifacts/securedocs-dashboard/dist/public/)
RUN cd artifacts/securedocs-dashboard && pnpm run build

# --- Stage 3: Serve with Nginx ---
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/artifacts/securedocs-dashboard/dist/public/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
