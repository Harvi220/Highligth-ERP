# Multi-stage build для оптимизации
FROM php:8.2-fpm-alpine AS base

# Установка системных зависимостей
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    icu-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libwebp-dev

# Установка PHP расширений
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd intl zip opcache

# Установка Redis
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ========================================
# Stage: Установка LibreOffice
# ========================================
FROM base AS libreoffice

RUN apk add --no-cache \
    libreoffice \
    ttf-dejavu \
    msttcorefonts-installer \
    fontconfig \
    && update-ms-fonts \
    && fc-cache -f

# ========================================
# Stage: Dependencies
# ========================================
FROM libreoffice AS dependencies

# Копируем файлы зависимостей
COPY composer.json composer.lock ./

# Устанавливаем production зависимости
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --optimize-autoloader

# ========================================
# Stage: Production
# ========================================
FROM libreoffice AS production

# Копируем зависимости из предыдущего stage
COPY --from=dependencies /var/www/html/vendor ./vendor

# Копируем весь код приложения
COPY . .

# Копируем оптимизированный autoloader
COPY --from=dependencies /var/www/html/vendor ./vendor

# Генерируем optimized autoloader
RUN composer dump-autoload --optimize --classmap-authoritative

# Настройка прав доступа
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Копируем production PHP конфигурацию
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Копируем entrypoint скрипт
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

USER www-data

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint"]
CMD ["php-fpm"]
