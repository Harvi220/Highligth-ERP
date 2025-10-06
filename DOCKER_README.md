# 🐳 Docker Setup - Highlight ERP

Быстрое руководство по работе с Docker контейнерами.

## 📦 Структура проекта

```
Highlight_ERP/
├── docker-compose.yml          # Оркестрация всех сервисов
├── .env.production.example     # Пример production конфигурации
├── Makefile                    # Удобные команды для управления
│
├── highlight-erp/              # Backend (Laravel)
│   ├── Dockerfile             # Multi-stage build для PHP-FPM
│   ├── .dockerignore          # Исключаемые файлы
│   └── docker/
│       ├── php/
│       │   ├── php.ini        # PHP конфигурация
│       │   └── opcache.ini    # OPcache оптимизация
│       ├── nginx/
│       │   └── nginx.conf     # Nginx конфигурация
│       └── entrypoint.sh      # Скрипт запуска
│
└── highlight-erp_front/        # Frontend (React + Vite)
    ├── Dockerfile             # Multi-stage build с Nginx
    ├── .dockerignore          # Исключаемые файлы
    └── docker/
        ├── nginx/
        │   └── nginx.conf     # Nginx + reverse proxy
        └── entrypoint.sh      # Скрипт запуска
```

## 🚀 Быстрый старт

### 1. Установка (первый раз)

```bash
# Создать .env и настроить
cp .env.production.example .env
nano .env

# Автоматическая установка
make install
```

### 2. Основные команды

```bash
# Запустить все сервисы
make up

# Остановить все сервисы
make down

# Перезапустить
make restart

# Посмотреть логи
make logs

# Посмотреть статус
make health
```

## 🏗️ Архитектура

### Сервисы

#### 1. **Database (PostgreSQL 16)**
- Порт: 5432
- Persistent volume: `postgres_data`
- Health check: каждые 10 секунд

#### 2. **Redis**
- Порт: 6379
- Используется для: cache, sessions, queues
- Persistent volume: `redis_data`

#### 3. **App (Laravel PHP-FPM)**
- PHP 8.2 на Alpine Linux
- Установлен LibreOffice для конвертации документов
- OPcache включен для максимальной производительности
- Volumes: storage, logs

#### 4. **Queue Worker**
- Отдельный контейнер для обработки очередей
- Автоматический перезапуск при сбоях
- Timeout: 300 секунд

#### 5. **Nginx Backend**
- Порт: 8000
- Reverse proxy для PHP-FPM
- Раздача статических файлов

#### 6. **Frontend (React + Nginx)**
- Порт: 3000
- Multi-stage build: сборка + production Nginx
- Reverse proxy на backend для /api
- SPA routing support

### Volumes

| Volume | Назначение |
|--------|-----------|
| `postgres_data` | Данные PostgreSQL |
| `redis_data` | Данные Redis |
| `storage_data` | Загруженные файлы (documents) |
| `storage_logs` | Логи приложения |

## 🔧 Разработка

### Локальная разработка с hot-reload

Для разработки рекомендуется использовать `composer run dev` на хосте вместо Docker контейнеров для лучшей производительности.

### Доступ к контейнерам

```bash
# Laravel shell
make shell-app
php artisan --version

# Database shell
make shell-db
\dt  # показать таблицы

# Redis shell
make shell-redis
KEYS *

# Frontend shell
make shell-frontend
```

### Запуск команд

```bash
# Artisan команды
make artisan cmd="migrate"
make artisan cmd="queue:work"
make artisan cmd="tinker"

# Composer
make composer cmd="install"
make composer cmd="require package/name"

# Миграции
make migrate
make migrate-fresh
make seed
```

## 🔐 Security Best Practices

### 1. Переменные окружения

```env
# ❌ Плохо
APP_KEY=base64:insecure_key
DB_PASSWORD=password123

# ✅ Хорошо
APP_KEY=base64:random_generated_32_character_key
DB_PASSWORD=Xy9$mK#pL2nQ@8wR  # Сгенерировано криптографически
```

### 2. Права доступа

```bash
# Проверить права на storage
docker-compose exec app ls -la storage/

# Исправить если нужно
docker-compose exec app chown -R www-data:www-data storage
```

### 3. Firewall

```bash
# Разрешить только необходимые порты
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw enable

# Блокировать прямой доступ к портам сервисов
sudo ufw deny 5432/tcp  # PostgreSQL
sudo ufw deny 6379/tcp  # Redis
```

## 📊 Мониторинг

### Health Checks

Все сервисы имеют встроенные health checks:

```bash
# Общий статус
docker-compose ps

# Подробная информация
docker inspect highlight-erp-app --format='{{json .State.Health}}'
```

### Логи

```bash
# Все логи
make logs

# Конкретный сервис
make logs-app
make logs-queue
make logs-frontend

# Последние N строк
docker-compose logs --tail=100 app

# Follow mode
docker-compose logs -f app
```

### Метрики

```bash
# Использование ресурсов
docker stats

# Информация о контейнере
docker-compose top app
```

## 🛠️ Troubleshooting

### Контейнеры не запускаются

```bash
# 1. Проверить логи
docker-compose logs

# 2. Проверить конфигурацию
docker-compose config

# 3. Пересоздать контейнеры
docker-compose up -d --force-recreate

# 4. Полная очистка и перезапуск
make clean
make build
make up
```

### Ошибка "port already in use"

```bash
# Найти процесс использующий порт
sudo lsof -i :8000

# Изменить порт в .env
BACKEND_PORT=8001
FRONTEND_PORT=3001

# Перезапустить
make down && make up
```

### База данных не доступна

```bash
# Проверить логи PostgreSQL
docker-compose logs db

# Проверить подключение
docker-compose exec db pg_isready -U postgres

# Пересоздать volume (ОСТОРОЖНО: удалит данные!)
docker-compose down -v
docker volume rm highlight_erp_postgres_data
make up
```

### LibreOffice не работает

```bash
# Проверить установку
make shell-app
soffice --version

# Права на временные файлы
mkdir -p /tmp/soffice
chmod 777 /tmp/soffice

# Тест конвертации
cd /var/www/html/storage/app/public/documents
soffice --headless --convert-to pdf test.docx --outdir /tmp
```

## 🚀 Production Tips

### 1. Ресурсы

```yaml
# docker-compose.yml
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

### 2. Автоперезапуск

```yaml
services:
  app:
    restart: unless-stopped  # ✅ Рекомендуется
    # restart: always        # Альтернатива
```

### 3. Логирование

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Backup Strategy

```bash
# Ежедневный backup БД
0 3 * * * cd /path/to/project && make backup-db

# Ежедневный backup storage
0 4 * * * tar -czf storage_$(date +\%Y\%m\%d).tar.gz -C /path/to/project/highlight-erp/storage app

# Удаление старых backups
0 5 * * * find /backups -name "*.sql" -mtime +30 -delete
```

## 📚 Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Laravel Docker Best Practices](https://laravel.com/docs/deployment)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 💡 Советы

1. **Используйте .env файл** для всех настроек окружения
2. **Не коммитьте .env** в git
3. **Используйте volumes** для persistent данных
4. **Настройте health checks** для критичных сервисов
5. **Мониторьте логи** регулярно
6. **Делайте backups** ежедневно
7. **Тестируйте обновления** на staging перед production
8. **Используйте Makefile** для упрощения команд

---

**Вопросы?** Обращайтесь к [DEPLOYMENT.md](./DEPLOYMENT.md) для детального руководства.
