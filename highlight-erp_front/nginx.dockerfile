# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование всех файлов проекта
COPY . .

# Сборка production билда
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Копирование собранного билда из Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose порт 80
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
