# Multi-stage build для React + Vite приложения

# ========================================
# Stage 1: Build
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false

# Копируем исходный код
COPY . .

# Собираем production build
RUN npm run build

# ========================================
# Stage 2: Production with Nginx
# ========================================
FROM nginx:alpine AS production

# Устанавливаем необходимые инструменты
RUN apk add --no-cache curl

# Удаляем дефолтную конфигурацию nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем нашу конфигурацию nginx
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем entrypoint скрипт
COPY docker/entrypoint.sh /docker-entrypoint.d/40-envsubst-on-templates.sh
RUN chmod +x /docker-entrypoint.d/40-envsubst-on-templates.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
