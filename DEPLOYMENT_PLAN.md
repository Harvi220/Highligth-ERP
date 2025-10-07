# План подготовки и деплоя Highlight ERP на k3s

## 📋 Анализ текущего состояния проекта

### Backend (Laravel)
- ✅ Laravel 12 с PHP 8.2+
- ✅ API с Laravel Sanctum
- ✅ Миграции БД настроены
- ❌ Нет Dockerfile для PHP-контейнера
- ❌ Нет манифестов k3s

### Frontend (React)
- ✅ React 19 с TypeScript
- ✅ Vite для сборки
- ❌ Нет Dockerfile для nginx
- ❌ Нет манифестов k3s

### База данных
- ❌ Нужно создать БД на сервере
- ❌ Нужно создать пользователя БД
- ❌ Нужно настроить подключение

---

## 🔧 План доработок для деплоя

### 1. Создание Dockerfile для Backend (PHP-FPM)
**Файл:** `highlight-erp/Dockerfile` или `highlight-erp/php.dockerfile`

**Необходимо:**
- Базовый образ: `php:8.2-fpm-alpine`
- Установить расширения PHP: pdo, pdo_mysql, mbstring, exif, pcntl, bcmath, gd
- Установить Composer
- Скопировать исходный код
- Установить зависимости: `composer install --no-dev --optimize-autoloader`
- Настроить права доступа для storage и bootstrap/cache
- Expose порт 9000

### 2. Создание Dockerfile для Frontend (Nginx)
**Файл:** `highlight-erp_front/Dockerfile` или `highlight-erp_front/nginx.dockerfile`

**Необходимо:**
- Мультистейдж сборка:
  - Stage 1: Node.js для сборки (`node:20-alpine`)
  - Stage 2: Nginx для раздачи статики (`nginx:alpine`)
- Скопировать package.json и package-lock.json
- Установить зависимости: `npm ci`
- Собрать production билд: `npm run build`
- Скопировать dist в nginx
- Настроить nginx.conf для SPA (fallback на index.html)
- Expose порт 80

### 3. Создание nginx конфигурации
**Файл:** `highlight-erp/nginx.conf` или `highlight-erp_front/nginx.conf`

**Необходимо:**
- Обработка PHP через FastCGI (php-fpm)
- Настройка для Laravel (public/index.php)
- Настройка для React SPA
- Gzip compression
- Client max body size (для загрузки файлов)

### 4. Создание .dockerignore файлов
**Backend:** `highlight-erp/.dockerignore`
```
.git
.env
node_modules
vendor
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
```

**Frontend:** `highlight-erp_front/.dockerignore`
```
.git
node_modules
dist
.env
```

### 5. Подготовка .env файла для production
**Файл:** `highlight-erp/.env.production` (шаблон)

**Необходимо настроить:**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://highlight-erp.zennex.ru`
- `DB_HOST=mysql-service` (внутренний сервис k3s)
- `DB_DATABASE=highlight_erp`
- `DB_USERNAME=highlight_erp_user`
- `DB_PASSWORD=<сильный пароль>`
- `SESSION_DRIVER=database` или `redis`
- `CACHE_DRIVER=redis` (опционально)

### 6. Создание манифестов k3s
**Директория:** `highlight-erp/.k3s/` или `.k3s/` в корне проекта

#### 6.1. Deployment для PHP-FPM
**Файл:** `deployment-php.yaml`

**Необходимо:**
- `kind: Deployment`
- `replicas: 1` (можно увеличить при нагрузке)
- `imagePullSecrets: registry-secret`
- `imagePullPolicy: Always`
- `image: registry.zennex.ru/highlight-erp/php:latest`
- Volume mounts для storage и .env
- Liveness и readiness probes
- Resource limits (memory, cpu)

#### 6.2. Deployment для Nginx
**Файл:** `deployment-nginx.yaml`

**Необходимо:**
- `kind: Deployment`
- `replicas: 1`
- `imagePullSecrets: registry-secret`
- `imagePullPolicy: Always`
- `image: registry.zennex.ru/highlight-erp/nginx:latest`
- Volume mounts для конфигурации
- Liveness и readiness probes

#### 6.3. Service для PHP-FPM
**Файл:** `service-php.yaml`

**Необходимо:**
- `kind: Service`
- `type: ClusterIP`
- `port: 9000`
- Selector для PHP deployment

#### 6.4. Service для Nginx
**Файл:** `service-nginx.yaml`

**Необходимо:**
- `kind: Service`
- `type: ClusterIP`
- `port: 80`
- Selector для Nginx deployment

#### 6.5. Ingress для внешнего доступа
**Файл:** `ingress.yaml`

**Необходимо:**
- `kind: Ingress`
- `annotations:`
  - `kubernetes.io/ingress.class: "nginx"`
  - `cert-manager.io/cluster-issuer: "letsencrypt-prod"`
- `tls:`
  - `hosts: [highlight-erp.zennex.ru]`
  - `secretName: highlight-erp-tls`
- `rules:` маршрутизация на nginx service
- Настройка для API и Frontend

#### 6.6. ConfigMap для конфигов
**Файл:** `configmap.yaml`

**Необходимо:**
- Конфигурация nginx
- Конфигурация PHP (php.ini overrides)

#### 6.7. Secret для .env
**Файл:** `secret.yaml` (НЕ коммитить!)

**Необходимо:**
- `kind: Secret`
- Base64 encoded значения для:
  - `APP_KEY`
  - `DB_PASSWORD`
  - Другие sensitive данные

#### 6.8. PersistentVolumeClaim для storage
**Файл:** `pvc-storage.yaml`

**Необходимо:**
- `kind: PersistentVolumeClaim`
- `accessModes: [ReadWriteOnce]`
- `resources.requests.storage: 5Gi`
- Для хранения загруженных файлов (documents)

### 7. Настройка CI/CD (опционально, но рекомендуется)
**Файл:** `.gitlab-ci.yml` в корне проекта

**Необходимо:**
- Stage: build
  - Сборка PHP и Nginx образов
  - Push в registry.zennex.ru
- Stage: deploy
  - SSH на сервер
  - `kubectl rollout restart deployment`

---

## 📝 План действий по деплою

### Этап 1: Подготовка проекта (локально)

#### 1.1. Создать Dockerfiles
- [ ] Создать `highlight-erp/php.dockerfile`
- [ ] Создать `highlight-erp_front/nginx.dockerfile`
- [ ] Создать `highlight-erp/nginx.conf` для Laravel
- [ ] Создать `highlight-erp_front/nginx.conf` для React SPA

#### 1.2. Создать .dockerignore файлы
- [ ] Создать `highlight-erp/.dockerignore`
- [ ] Создать `highlight-erp_front/.dockerignore`

#### 1.3. Подготовить манифесты k3s
- [ ] Создать директорию `.k3s/` в корне проекта
- [ ] Создать `deployment-php.yaml`
- [ ] Создать `deployment-nginx.yaml`
- [ ] Создать `service-php.yaml`
- [ ] Создать `service-nginx.yaml`
- [ ] Создать `ingress.yaml`
- [ ] Создать `configmap.yaml`
- [ ] Создать `pvc-storage.yaml`
- [ ] Создать `.env.production` шаблон

#### 1.4. Подготовить БД миграции
- [ ] Проверить все миграции
- [ ] Подготовить seeders для начальных данных (admin, roles)

### Этап 2: Сборка и публикация образов

#### 2.1. Включить Container Registry в GitLab
- [ ] Зайти в проект GitLab под techuser
- [ ] Settings → General → Visibility → включить Container Registry

#### 2.2. Авторизоваться в GitLab Registry (локально)
```bash
docker login registry.zennex.ru
```

#### 2.3. Собрать образ PHP-FPM
```bash
cd highlight-erp
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/php:latest \
  -f php.dockerfile .
```

#### 2.4. Собрать образ Nginx
```bash
cd highlight-erp_front
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/nginx:latest \
  -f nginx.dockerfile .
```

#### 2.5. Отправить образы в Registry
```bash
docker push registry.zennex.ru/highlight-erp/php:latest
docker push registry.zennex.ru/highlight-erp/nginx:latest
```

### Этап 3: Подготовка сервера

#### 3.1. Подключиться к серверу по SSH
```bash
ssh root@zennex.ru -p 333
```

#### 3.2. Создать директорию проекта
```bash
cd /var/www/
mkdir highlight-erp.zennex.ru
cd highlight-erp.zennex.ru
```

#### 3.3. Создать структуру директорий
```bash
mkdir src
mkdir .k3s
mkdir storage
mkdir conf
```

#### 3.4. Клонировать исходный код (для конфигов и манифестов)
```bash
cd src
git clone git@gitlab.zennex.ru:your-group/highlight-erp.git .
# Примечание: точка в конце - чтобы не создавать вложенную папку
```

#### 3.5. Скопировать манифесты k3s
```bash
cp -r /var/www/highlight-erp.zennex.ru/src/.k3s/* /var/www/highlight-erp.zennex.ru/.k3s/
```

### Этап 4: Настройка базы данных

#### 4.1. Подключиться к MySQL pod
```bash
kubectl exec -it mysql-0 -- bash
```

#### 4.2. Войти в MySQL
```bash
mysql -u root_zennex -p
# Ввести пароль от администратора
```

#### 4.3. Создать базу данных
```sql
CREATE DATABASE highlight_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4.4. Проверить существующих пользователей
```sql
SELECT User, Host FROM mysql.user;
```

#### 4.5. Создать пользователя
```sql
CREATE USER 'highlight_erp_user'@'%' IDENTIFIED BY 'StrongPassword123!';
```

#### 4.6. Выдать права на БД
```sql
GRANT ALL PRIVILEGES ON highlight_erp.* TO 'highlight_erp_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### Этап 5: Создание Secret с .env данными

#### 5.1. Создать .env файл на сервере
```bash
cd /var/www/highlight-erp.zennex.ru
nano .env.production
```

#### 5.2. Заполнить .env значениями
```env
APP_NAME="Highlight ERP"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://highlight-erp.zennex.ru
APP_KEY=<сгенерировать через php artisan key:generate>

DB_CONNECTION=mysql
DB_HOST=mysql-service
DB_PORT=3306
DB_DATABASE=highlight_erp
DB_USERNAME=highlight_erp_user
DB_PASSWORD=StrongPassword123!

# ... остальные настройки
```

#### 5.3. Создать Kubernetes Secret из .env
```bash
kubectl create secret generic highlight-erp-env \
  --from-env-file=/var/www/highlight-erp.zennex.ru/.env.production
```

### Этап 6: Применение манифестов k3s

#### 6.1. Перейти в директорию с манифестами
```bash
cd /var/www/highlight-erp.zennex.ru/.k3s
```

#### 6.2. Применить манифесты
```bash
kubectl apply -f .
```

#### 6.3. Проверить статус подов
```bash
kubectl get pods
```

#### 6.4. Проверить логи при ошибках
```bash
kubectl describe pod <название-пода>
kubectl logs <название-пода>
```

### Этап 7: Выполнение миграций БД

#### 7.1. Подключиться к PHP pod
```bash
kubectl exec -it <php-pod-name> -- bash
```

#### 7.2. Запустить миграции
```bash
php artisan migrate --force
```

#### 7.3. Запустить seeders (если нужно)
```bash
php artisan db:seed --force
```

#### 7.4. Создать тестового администратора (если нет seeders)
```bash
php artisan tinker
# Затем создать пользователя вручную
```

### Этап 8: Проверка работоспособности

#### 8.1. Проверить все поды
```bash
kubectl get pods -o wide
```

#### 8.2. Проверить services
```bash
kubectl get services
```

#### 8.3. Проверить ingress
```bash
kubectl get ingress
```

#### 8.4. Проверить SSL-сертификат
```bash
kubectl describe ingress highlight-erp-ingress
```

#### 8.5. Проверить доступность приложения
- Открыть https://highlight-erp.zennex.ru
- Проверить вход в систему
- Проверить загрузку документов

### Этап 9: Настройка домена (если нужно)

#### 9.1. Добавить DNS A-запись
- Домен: `highlight-erp.zennex.ru`
- IP: IP-адрес сервера zennex.ru

#### 9.2. Дождаться распространения DNS
```bash
nslookup highlight-erp.zennex.ru
```

---

## 🔄 Обновление приложения (после деплоя)

### Процесс обновления

#### 1. Внести изменения в код (локально)
```bash
git add .
git commit -m "Описание изменений"
git push origin master
```

#### 2. Пересобрать образы
```bash
# PHP
cd highlight-erp
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/php:latest \
  -f php.dockerfile .
docker push registry.zennex.ru/highlight-erp/php:latest

# Nginx (если были изменения во frontend)
cd highlight-erp_front
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/nginx:latest \
  -f nginx.dockerfile .
docker push registry.zennex.ru/highlight-erp/nginx:latest
```

#### 3. Применить обновление на сервере
```bash
ssh root@zennex.ru -p 333

# Узнать название deployment
kubectl get deployments

# Перезапустить deployment
kubectl rollout restart deployment highlight-erp-php-deployment
kubectl rollout restart deployment highlight-erp-nginx-deployment

# Проверить статус
kubectl rollout status deployment highlight-erp-php-deployment
kubectl get pods
```

---

## 🛠️ Полезные команды для управления

### Просмотр логов
```bash
# Логи PHP
kubectl logs -f <php-pod-name>

# Логи Nginx
kubectl logs -f <nginx-pod-name>

# Логи с фильтрацией
kubectl logs <pod-name> --tail=100 | grep ERROR
```

### Подключение к контейнеру
```bash
kubectl exec -it <pod-name> -- bash
```

### Масштабирование
```bash
kubectl scale deployment highlight-erp-php-deployment --replicas=2
```

### Просмотр ресурсов
```bash
kubectl top pods
kubectl top nodes
```

### Очистка кэша Laravel (внутри PHP pod)
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## ⚠️ Важные моменты

### Безопасность
- ❗ НЕ коммитить `.env` и `secret.yaml` в Git
- ❗ Использовать сильные пароли для БД
- ❗ Регулярно обновлять зависимости (composer update, npm update)
- ❗ Настроить firewall на сервере
- ❗ Ограничить доступ по SSH только по ключу

### Производительность
- Использовать `composer install --no-dev --optimize-autoloader`
- Включить OPcache в PHP
- Настроить Redis для кэша и сессий (опционально)
- Использовать CDN для статики (опционально)

### Мониторинг
- Настроить логирование ошибок Laravel
- Мониторить использование ресурсов (CPU, RAM, Disk)
- Проверять логи nginx и PHP-FPM

### Бэкапы
- БД автоматически бэкапится в `/var/backups/mysql_serivice_databases`
- Настроить бэкапы uploaded файлов из PersistentVolume
- Хранить бэкапы конфигов и манифестов

---

## 📚 Справочная информация

### Структура проекта на сервере
```
/var/www/highlight-erp.zennex.ru/
├── .k3s/                    # Манифесты Kubernetes
│   ├── deployment-php.yaml
│   ├── deployment-nginx.yaml
│   ├── service-php.yaml
│   ├── service-nginx.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── pvc-storage.yaml
│   └── secret.yaml
├── src/                     # Исходный код (для справки)
├── storage/                 # PersistentVolume mount
├── conf/                    # Конфиги (если нужны)
└── .env.production          # Production конфигурация
```

### GitLab Registry
- URL: `registry.zennex.ru`
- Проект: `highlight-erp`
- Образы:
  - `registry.zennex.ru/highlight-erp/php:latest`
  - `registry.zennex.ru/highlight-erp/nginx:latest`

### Серверные эндпоинты
- SSH: `ssh root@zennex.ru -p 333`
- Приложение: `https://highlight-erp.zennex.ru`
- БД внутренний хост: `mysql-service:3306`
- БД имя: `highlight_erp`
- БД пользователь: `highlight_erp_user`

---

## ✅ Чеклист готовности к деплою

### Код и конфигурация
- [ ] Dockerfile для PHP создан и протестирован
- [ ] Dockerfile для Nginx создан и протестирован
- [ ] nginx.conf настроен для Laravel и React
- [ ] .dockerignore файлы созданы
- [ ] Все манифесты k3s подготовлены
- [ ] .env.production настроен

### GitLab и Registry
- [ ] Container Registry включен в проекте
- [ ] Авторизация в registry.zennex.ru выполнена
- [ ] Образы собраны для linux/amd64
- [ ] Образы загружены в Registry

### Сервер
- [ ] SSH доступ к серверу получен
- [ ] Директория проекта создана
- [ ] БД и пользователь созданы
- [ ] Secret с .env создан в k3s
- [ ] PersistentVolume для storage настроен

### Деплой
- [ ] Манифесты применены (kubectl apply)
- [ ] Все поды в статусе Running
- [ ] Миграции БД выполнены
- [ ] SSL-сертификат получен (Let's Encrypt)
- [ ] Приложение доступно по HTTPS
- [ ] Логин работает
- [ ] Загрузка файлов работает

### Финальная проверка
- [ ] Проверить все функции: документы, сотрудники, статистика
- [ ] Проверить логи на ошибки
- [ ] Проверить производительность
- [ ] Создать документацию для команды

---

**Дата создания плана:** 2025-10-07
**Статус:** Готов к выполнению
**Примерное время выполнения:** 4-6 часов (при наличии опыта с Docker и k3s)
