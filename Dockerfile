# ── Stage 1 : build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copier uniquement le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Supprimer la config par défaut nginx (évite les conflits)
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

# Tourner en tant qu'utilisateur non-root nginx
USER nginx

CMD ["nginx", "-g", "daemon off;"]
