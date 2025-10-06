.PHONY: help build up down restart logs shell-app shell-db clean migrate seed fresh install production-deploy

# ========================================
# Default target
# ========================================
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ========================================
# Docker Commands
# ========================================
build: ## Build all Docker images
	docker-compose build --no-cache

up: ## Start all containers
	docker-compose up -d

down: ## Stop all containers
	docker-compose down

restart: ## Restart all containers
	docker-compose restart

stop: ## Stop all containers without removing
	docker-compose stop

logs: ## Show logs from all containers
	docker-compose logs -f

logs-app: ## Show Laravel app logs
	docker-compose logs -f app

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-queue: ## Show queue worker logs
	docker-compose logs -f queue

# ========================================
# Shell Access
# ========================================
shell-app: ## Shell access to Laravel container
	docker-compose exec app sh

shell-db: ## Shell access to PostgreSQL database
	docker-compose exec db psql -U postgres -d highlight_erp

shell-redis: ## Shell access to Redis
	docker-compose exec redis redis-cli -a secret

shell-frontend: ## Shell access to frontend container
	docker-compose exec frontend sh

# ========================================
# Laravel Commands
# ========================================
migrate: ## Run database migrations
	docker-compose exec app php artisan migrate

migrate-fresh: ## Fresh migration (WARNING: drops all tables)
	docker-compose exec app php artisan migrate:fresh

seed: ## Run database seeders
	docker-compose exec app php artisan db:seed

fresh: ## Fresh migration with seeding
	docker-compose exec app php artisan migrate:fresh --seed

artisan: ## Run artisan command (use: make artisan cmd="your command")
	docker-compose exec app php artisan $(cmd)

composer: ## Run composer command (use: make composer cmd="your command")
	docker-compose exec app composer $(cmd)

# ========================================
# Cache Commands
# ========================================
cache-clear: ## Clear all Laravel caches
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

cache-optimize: ## Optimize Laravel caches for production
	docker-compose exec app php artisan config:cache
	docker-compose exec app php artisan route:cache
	docker-compose exec app php artisan view:cache
	docker-compose exec app php artisan event:cache

# ========================================
# Installation & Setup
# ========================================
install: ## Initial installation and setup
	@echo "📦 Installing Highlight ERP..."
	@if [ ! -f .env ]; then \
		echo "⚠️  Creating .env file..."; \
		cp .env.production.example .env; \
		echo "✅ .env file created. Please update it with your settings."; \
	fi
	@echo "🏗️  Building Docker images..."
	make build
	@echo "🚀 Starting containers..."
	make up
	@echo "⏳ Waiting for services to be ready..."
	sleep 10
	@echo "🔑 Generating application key..."
	docker-compose exec app php artisan key:generate
	@echo "📊 Running migrations..."
	make migrate
	@echo "🔗 Creating storage link..."
	docker-compose exec app php artisan storage:link
	@echo "✅ Installation complete!"
	@echo ""
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8000"

# ========================================
# Production Deployment
# ========================================
production-deploy: ## Deploy to production (build, migrate, optimize)
	@echo "🚀 Deploying to production..."
	@echo "🏗️  Building images..."
	docker-compose build --no-cache
	@echo "⬇️  Stopping old containers..."
	docker-compose down
	@echo "⬆️  Starting new containers..."
	docker-compose up -d
	@echo "⏳ Waiting for database..."
	sleep 10
	@echo "📊 Running migrations..."
	docker-compose exec app php artisan migrate --force
	@echo "⚡ Optimizing caches..."
	make cache-optimize
	@echo "✅ Production deployment complete!"

production-rollback: ## Rollback to previous version
	@echo "⏮️  Rolling back..."
	docker-compose down
	git checkout HEAD~1
	docker-compose up -d
	sleep 10
	docker-compose exec app php artisan migrate --force
	make cache-optimize
	@echo "✅ Rollback complete!"

# ========================================
# Maintenance
# ========================================
clean: ## Clean up containers, images, and volumes
	docker-compose down -v
	docker system prune -af

backup-db: ## Backup database
	@echo "💾 Creating database backup..."
	docker-compose exec -T db pg_dump -U postgres highlight_erp > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created!"

restore-db: ## Restore database (use: make restore-db file=backup.sql)
	@echo "📥 Restoring database from $(file)..."
	docker-compose exec -T db psql -U postgres highlight_erp < $(file)
	@echo "✅ Database restored!"

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	docker-compose ps

# ========================================
# Development
# ========================================
dev-up: ## Start development environment
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

test: ## Run tests
	docker-compose exec app php artisan test

test-coverage: ## Run tests with coverage
	docker-compose exec app php artisan test --coverage

lint: ## Run Laravel Pint (code style fixer)
	docker-compose exec app ./vendor/bin/pint

# ========================================
# Queue & Scheduler
# ========================================
queue-restart: ## Restart queue workers
	docker-compose restart queue

queue-failed: ## Show failed queue jobs
	docker-compose exec app php artisan queue:failed

queue-retry: ## Retry all failed queue jobs
	docker-compose exec app php artisan queue:retry all
