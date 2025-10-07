# Базовый образ PHP-FPM
FROM php:8.2-fpm-alpine

# Установка зависимостей системы
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    mysql-client \
    git \
    unzip \
    supervisor

# Установка расширений PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Установка рабочей директории
WORKDIR /var/www/html

# Копирование composer файлов
COPY composer.json composer.lock ./

# Установка зависимостей без dev-пакетов
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

# Копирование всех файлов проекта
COPY . .

# Завершение установки Composer с автозагрузкой
RUN composer dump-autoload --optimize

# Создание необходимых директорий и установка прав
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Копирование конфигурации PHP
COPY ./docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Копирование конфигурации PHP-FPM
COPY ./docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Expose порт PHP-FPM
EXPOSE 9000

# Запуск PHP-FPM
CMD ["php-fpm"]
