# ============================================
# Multi-stage Dockerfile
# Frontend (build) + Backend + Nginx
# ============================================

# -----------------------------
# Stage 1: Frontend Build
# -----------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# Install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
# Note: VITE_API_URL must be set at build time for frontend
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# -----------------------------
# Stage 2: Backend Build
# -----------------------------
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY server/package.json server/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY server/tsconfig.json ./server/
COPY server/prisma ./prisma
COPY server/src ./src

WORKDIR /app/server
RUN pnpm build

# -----------------------------
# Stage 3: Production Container
# -----------------------------
FROM node:20-alpine AS production

# Install nginx and dumb-init
RUN apk add --no-cache nginx dumb-init

# Create user for running app
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/package.json ./package.json

# Copy frontend build
COPY --from=frontend-builder /app/dist ./dist/public

# Copy nginx config
COPY <<-'EOF' /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;
    root /app/dist/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE proxy
    location /api/sse {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        chunked_transfer_encoding on;
    }

    # SPA fallback - all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Copy startup script
COPY <<-'EOF' /start.sh
#!/bin/sh
set -e

# Run Prisma migrations (if needed)
# Uncomment below line if you want auto-migration on startup
# npx prisma migrate deploy

# Start nginx in background
nginx &

# Start backend server
exec su-exec appuser node dist/server.js
EOF

RUN chmod +x /start.sh

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 80

CMD ["/start.sh"]