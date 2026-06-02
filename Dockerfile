# ============================================
# Multi-stage Dockerfile
# Frontend (build) + Backend (serves frontend)
# ============================================

# -----------------------------
# Stage 1: Frontend Build
# -----------------------------
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all workspace dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY postcss.config.js ./
COPY components.json ./

# Build frontend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# -----------------------------
# Stage 2: Production Container
# -----------------------------
FROM node:22-alpine AS production

# Install libretls for Prisma (Alpine 3.19+ uses OpenSSL 3.x)
RUN apk add --no-cache libretls dumb-init

# Create user for running app
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy backend
COPY server/package.json server/package-lock.json ./
COPY server/prisma ./prisma

# Install dependencies (including @fastify/static for serving frontend)
RUN npm install --frozen-lockfile

# Copy server source and build
COPY server/tsconfig.json .
COPY server/src ./src
RUN npm run build

# Copy frontend build from builder
COPY --from=frontend-builder /app/dist ./dist/public

# Generate Prisma client
RUN npx prisma generate --schema /app/prisma/schema.prisma

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

CMD ["dumb-init", "node", "dist/server.js"]