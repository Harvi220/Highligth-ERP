#!/bin/sh
set -e

echo "🚀 Starting Laravel application..."

# Wait for database to be ready
if [ -n "$DB_HOST" ]; then
    echo "⏳ Waiting for database connection..."
    until nc -z "$DB_HOST" "${DB_PORT:-3306}" 2>/dev/null; do
        echo "Database is unavailable - sleeping"
        sleep 2
    done
    echo "✅ Database is ready"
fi

# Create OPcache directory
mkdir -p /tmp/opcache

# Laravel optimizations
if [ "$APP_ENV" = "production" ]; then
    echo "📦 Running production optimizations..."

    # Run migrations
    php artisan migrate --force --no-interaction

    # Cache optimization
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache

    # Storage link
    php artisan storage:link || true

    echo "✅ Production optimizations completed"
else
    echo "🔧 Running in development mode..."
    php artisan migrate --no-interaction || true
    php artisan storage:link || true
fi

# Create required directories
mkdir -p storage/app/public/documents
mkdir -p storage/logs
mkdir -p storage/framework/{sessions,views,cache}

# Set permissions
chown -R www-data:www-data storage bootstrap/cache

echo "✅ Application ready!"

# Execute the main container command
exec "$@"
