# 🚀 Deployment Guide - Highlight ERP

Профессиональное руководство по развертыванию Highlight ERP в production с использованием Docker.

## 📋 Содержание

- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Production развертывание](#production-развертывание)
- [Конфигурация](#конфигурация)
- [Обслуживание](#обслуживание)
- [Мониторинг](#мониторинг)
- [Резервное копирование](#резервное-копирование)
- [Troubleshooting](#troubleshooting)

## 🔧 Требования

### Системные требования

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 2+ cores
- **RAM**: 4GB минимум, 8GB рекомендуется
- **Disk**: 20GB+ свободного места
- **Docker**: 24.0+
- **Docker Compose**: 2.20+

### Установка Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/highlight-erp.git
cd highlight-erp
```

### 2. Настройка окружения

```bash
# Создать .env файл из примера
cp .env.production.example .env

# Отредактировать .env файл
nano .env
```

**Важные настройки в .env:**

```env
APP_KEY=  # Будет сгенерирован автоматически
APP_URL=https://your-domain.com
DB_PASSWORD=your_strong_database_password
REDIS_PASSWORD=your_strong_redis_password
```

### 3. Автоматическая установка

```bash
make install
```

Эта команда:
- ✅ Создаст .env файл
- ✅ Соберет Docker образы
- ✅ Запустит все контейнеры
- ✅ Сгенерирует APP_KEY
- ✅ Выполнит миграции базы данных
- ✅ Создаст storage link

### 4. Проверка работоспособности

```bash
# Проверить статус контейнеров
make health

# Или вручную
docker-compose ps
```

**Доступ к приложению:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000/api
- 📊 PostgreSQL: localhost:5432
- 📦 Redis: localhost:6379

## 🏭 Production развертывание

### 1. Подготовка сервера

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить необходимые пакеты
sudo apt install -y git make curl

# Настроить firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. SSL сертификат (Let's Encrypt)

```bash
# Установить Certbot
sudo apt install -y certbot

# Получить сертификат
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### 3. Nginx Reverse Proxy (опционально)

Для production рекомендуется использовать Nginx как reverse proxy на хосте:

```nginx
# /etc/nginx/sites-available/highlight-erp
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Логи
    access_log /var/log/nginx/highlight-erp-access.log;
    error_log /var/log/nginx/highlight-erp-error.log;

    # Проксирование на frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Production deploy

```bash
# Развертывание в production
make production-deploy
```

### 5. Автозапуск при старте системы

```bash
# Создать systemd service
sudo nano /etc/systemd/system/highlight-erp.service
```

```ini
[Unit]
Description=Highlight ERP Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/highlight-erp
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Активировать service
sudo systemctl enable highlight-erp
sudo systemctl start highlight-erp
```

## ⚙️ Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `APP_ENV` | Окружение приложения | `production` |
| `APP_DEBUG` | Режим отладки | `false` |
| `DB_DATABASE` | Имя базы данных | `highlight_erp` |
| `DB_USERNAME` | Пользователь БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | - |
| `REDIS_PASSWORD` | Пароль Redis | - |
| `BACKEND_PORT` | Порт backend | `8000` |
| `FRONTEND_PORT` | Порт frontend | `3000` |

### Масштабирование

#### Горизонтальное масштабирование Queue Workers

```bash
# Увеличить количество workers
docker-compose up -d --scale queue=3
```

#### Вертикальное масштабирование

Отредактировать `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 🔧 Обслуживание

### Полезные команды

```bash
# Просмотр логов
make logs                 # Все логи
make logs-app            # Логи Laravel
make logs-queue          # Логи очередей
make logs-frontend       # Логи frontend

# Очистка кеша
make cache-clear         # Очистить все кеши
make cache-optimize      # Оптимизировать кеши

# Миграции
make migrate             # Выполнить миграции
make migrate-fresh       # Пересоздать БД (ОСТОРОЖНО!)

# Shell доступ
make shell-app           # Shell в Laravel контейнер
make shell-db            # Shell в PostgreSQL
make shell-redis         # Shell в Redis

# Artisan команды
make artisan cmd="route:list"
make artisan cmd="queue:work"
```

### Обновление приложения

```bash
# 1. Получить изменения
git pull origin main

# 2. Пересобрать образы
make build

# 3. Остановить контейнеры
make down

# 4. Запустить с новыми образами
make up

# 5. Выполнить миграции
make migrate

# 6. Оптимизировать
make cache-optimize
```

Или используйте одну команду:

```bash
make production-deploy
```

## 📊 Мониторинг

### Health Checks

Все сервисы имеют встроенные health checks:

```bash
# Проверить статус всех сервисов
make health
```

### Prometheus + Grafana (опционально)

Добавьте в `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - highlight-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - highlight-network
```

## 💾 Резервное копирование

### Автоматический backup базы данных

```bash
# Создать backup
make backup-db

# Восстановить из backup
make restore-db file=backup_20240101_120000.sql
```

### Настроить автоматический backup (cron)

```bash
# Добавить в crontab
crontab -e
```

```cron
# Backup каждый день в 3:00 AM
0 3 * * * cd /path/to/highlight-erp && make backup-db >> /var/log/backup.log 2>&1

# Удалять backups старше 30 дней
0 4 * * * find /path/to/highlight-erp/backup_*.sql -mtime +30 -delete
```

### Backup storage files

```bash
# Создать архив storage
tar -czf storage_backup_$(date +%Y%m%d).tar.gz \
  -C highlight-erp/storage/app public

# Восстановить storage
tar -xzf storage_backup_20240101.tar.gz \
  -C highlight-erp/storage/app
```

## 🐛 Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs app

# Проверить статус
docker-compose ps

# Пересоздать контейнер
docker-compose up -d --force-recreate app
```

### Ошибки миграций

```bash
# Откатить последнюю миграцию
make artisan cmd="migrate:rollback"

# Проверить статус миграций
make artisan cmd="migrate:status"

# Очистить и пересоздать БД (ОСТОРОЖНО!)
make migrate-fresh
```

### Проблемы с правами доступа

```bash
# Исправить права на storage
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache
```

### Нехватка памяти

```bash
# Увеличить memory limit в docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G

# Или для всего Docker
sudo nano /etc/docker/daemon.json
{
  "default-ulimits": {
    "memlock": {
      "Hard": -1,
      "Name": "memlock",
      "Soft": -1
    }
  }
}

sudo systemctl restart docker
```

### Проблемы с LibreOffice конвертацией

```bash
# Проверить установку LibreOffice
make shell-app
soffice --version

# Тестовая конвертация
soffice --headless --convert-to pdf test.docx --outdir /tmp
```

## 📞 Поддержка

- **Email**: support@your-company.com
- **Документация**: https://docs.your-company.com
- **Issues**: https://github.com/your-org/highlight-erp/issues

## 📄 Лицензия

Proprietary - All rights reserved
