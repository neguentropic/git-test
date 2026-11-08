# ── Stage 1 : build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : serve ──────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

# Copier uniquement le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx personnalisée (remplace la config par défaut)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cette image tourne déjà en utilisateur non-root et écoute sur 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]