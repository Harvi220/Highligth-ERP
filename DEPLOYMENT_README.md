# Инструкция по деплою Highlight ERP

## ✅ Подготовленные файлы

### Backend (highlight-erp/)
- ✅ `php.dockerfile` - Dockerfile для PHP-FPM контейнера
- ✅ `docker/php/php.ini` - Конфигурация PHP
- ✅ `docker/php/www.conf` - Конфигурация PHP-FPM
- ✅ `.dockerignore` - Исключения для Docker

### Frontend (highlight-erp_front/)
- ✅ `nginx.dockerfile` - Dockerfile для Nginx контейнера
- ✅ `nginx.conf` - Конфигурация Nginx для React SPA
- ✅ `.dockerignore` - Исключения для Docker

### Kubernetes манифесты (.k3s/)
- ✅ `deployment-php.yaml` - Deployment для PHP-FPM
- ✅ `deployment-nginx.yaml` - Deployment для Nginx
- ✅ `service-php.yaml` - Service для PHP-FPM
- ✅ `service-nginx.yaml` - Service для Nginx
- ✅ `ingress.yaml` - Ingress для внешнего доступа
- ✅ `pvc-storage.yaml` - PersistentVolumeClaim для хранения файлов

### Конфигурация
- ✅ `.env.production.example` - Шаблон production конфигурации

---

## 📋 Следующие шаги

### 1. Включить Container Registry в GitLab

```bash
# Зайти в GitLab под techuser
# Перейти в проект → Settings → General → Visibility
# Включить Container Registry
```

### 2. Авторизоваться в GitLab Registry

```bash
docker login registry.zennex.ru
# Ввести credentials
```

### 3. Собрать образ PHP-FPM

```bash
cd highlight-erp

docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/zennex/highlight:php \
  -f php.dockerfile .
```

### 4. Собрать образ Nginx

```bash
cd highlight-erp_front

docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/zennex/highlight:nginx \
  -f nginx.dockerfile .
```

### 5. Отправить образы в Registry

```bash
docker push registry.zennex.ru/zennex/highlight:php
docker push registry.zennex.ru/zennex/highlight:nginx
```

---

## 🖥️ Настройка сервера

### 1. Подключиться к серверу

```bash
ssh root@zennex.ru -p 333
```

### 2. Создать структуру директорий

```bash
cd /var/www/
mkdir highlight-erp.zennex.ru
cd highlight-erp.zennex.ru
mkdir src .k3s storage conf
```

### 3. Клонировать код (для конфигов и манифестов)

```bash
cd src
git clone <URL_вашего_репозитория> .
# Точка в конце важна!
```

### 4. Скопировать манифесты k3s

```bash
cp -r /var/www/highlight-erp.zennex.ru/src/.k3s/* /var/www/highlight-erp.zennex.ru/.k3s/
```

---

## 🗄️ Настройка базы данных

### 1. Подключиться к MySQL pod

```bash
kubectl exec -it mysql-0 -- bash
```

### 2. Войти в MySQL

```bash
mysql -u root_zennex -p
# Ввести пароль от администратора
```

### 3. Создать БД и пользователя

```sql
-- Проверить доступные БД
SHOW DATABASES;

-- Создать БД
CREATE DATABASE highlight_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Проверить пользователей
SELECT User, Host FROM mysql.user;

-- Создать пользователя
CREATE USER 'highlight_erp_user'@'%' IDENTIFIED BY 'СИЛЬНЫЙ_ПАРОЛЬ';

-- Выдать права
GRANT ALL PRIVILEGES ON highlight_erp.* TO 'highlight_erp_user'@'%';

-- Применить изменения
FLUSH PRIVILEGES;

-- Выйти
EXIT;
```

### 4. Выйти из pod

```bash
exit
```

---

## 🔐 Создание Secret с переменными окружения

### 1. Создать .env.production на сервере

```bash
cd /var/www/highlight-erp.zennex.ru
nano .env.production
```

### 2. Заполнить данными из .env.production.example

Важные параметры:
- `APP_KEY` - сгенерировать через `php artisan key:generate --show`
- `DB_PASSWORD` - пароль из шага создания БД
- `APP_URL=https://highlight-erp.zennex.ru`
- `DB_HOST=mysql-service`

### 3. Создать Kubernetes Secret

```bash
kubectl create secret generic highlight-erp-env \
  --from-env-file=/var/www/highlight-erp.zennex.ru/.env.production
```

### 4. Проверить создание Secret

```bash
kubectl get secrets | grep highlight-erp
```

---

## 🚀 Деплой приложения

### 1. Перейти в директорию с манифестами

```bash
cd /var/www/highlight-erp.zennex.ru/.k3s
```

### 2. Применить манифесты

```bash
kubectl apply -f .
```

### 3. Проверить статус подов

```bash
kubectl get pods
```

Должно быть:
```
highlight-erp-php-deployment-xxxxx    1/1  Running
highlight-erp-nginx-deployment-xxxxx  1/1  Running
```

### 4. При ошибках проверить логи

```bash
# Описание пода
kubectl describe pod <pod-name>

# Логи пода
kubectl logs <pod-name>

# Логи в реальном времени
kubectl logs -f <pod-name>
```

---

## 🗃️ Выполнение миграций

### 1. Подключиться к PHP pod

```bash
kubectl exec -it <php-pod-name> -- bash
```

### 2. Запустить миграции

```bash
php artisan migrate --force
```

### 3. Запустить seeders (если есть)

```bash
php artisan db:seed --force
```

### 4. Создать админа вручную (если нет seeders)

```bash
php artisan tinker

# В tinker:
$user = new App\Models\User();
$user->surname = 'Админ';
$user->name = 'Иван';
$user->patronymic = 'Иванович';
$user->phone = '79990001122';
$user->password = bcrypt('password');
$user->position_id = 1;
$user->role_id = 1;
$user->save();
```

### 5. Выйти из pod

```bash
exit
```

---

## 🌐 Проверка работоспособности

### 1. Проверить все ресурсы

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

### 2. Проверить SSL сертификат

```bash
kubectl describe ingress highlight-erp-ingress
```

Должен быть статус Certificate issued.

### 3. Открыть в браузере

```
https://highlight-erp.zennex.ru
```

### 4. Проверить логин

Тестовые данные:
- Телефон: `79990001122`
- Пароль: `password`

---

## 🔄 Обновление приложения

### 1. Внести изменения в код

```bash
git add .
git commit -m "Описание изменений"
git push
```

### 2. Пересобрать образы

```bash
# PHP
cd highlight-erp
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/zennex/highlight:php \
  -f php.dockerfile .
docker push registry.zennex.ru/zennex/highlight:php

# Nginx
cd highlight-erp_front
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/zennex/highlight:nginx \
  -f nginx.dockerfile .
docker push registry.zennex.ru/zennex/highlight:nginx
```

### 3. Перезапустить deployments на сервере

```bash
ssh root@zennex.ru -p 333

kubectl rollout restart deployment highlight-erp-php-deployment
kubectl rollout restart deployment highlight-erp-nginx-deployment

# Проверить статус
kubectl rollout status deployment highlight-erp-php-deployment
kubectl get pods
```

---

## 🛠️ Полезные команды

### Просмотр логов

```bash
# Логи PHP
kubectl logs -f <php-pod-name>

# Логи Nginx
kubectl logs -f <nginx-pod-name>

# Последние 100 строк с ошибками
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
kubectl exec -it <php-pod-name> -- bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## ⚠️ Важные замечания

### Безопасность
- ❗ НЕ коммитить `.env.production` в Git
- ❗ Использовать сильные пароли для БД
- ❗ Регулярно обновлять зависимости

### Бэкапы
- БД автоматически бэкапится в `/var/backups/mysql_serivice_databases`
- Настроить бэкапы файлов из PersistentVolume

### Мониторинг
- Проверять логи на ошибки
- Мониторить использование ресурсов (CPU, RAM, Disk)

---

## 🐛 Решение типовых проблем

### Pod не запускается (ErrImagePull)
```bash
# Проверить, что образ существует в Registry
# Проверить, что registry-secret настроен
kubectl get secrets
```

### База данных не подключается
```bash
# Проверить, что mysql-service доступен
kubectl get services -A | grep mysql

# Проверить логи PHP pod
kubectl logs <php-pod-name>
```

### SSL сертификат не выдается
```bash
# Проверить cert-manager
kubectl get certificaterequest
kubectl describe certificate highlight-erp-tls

# Проверить логи cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

---

## 📝 Лог выполнения

### 2025-10-08

#### ✅ Выполнено:
1. **Авторизация в Docker Registry**
   - Успешно авторизованы в `registry.zennex.ru`

2. **Сборка и отправка образов**
   - ✅ Собран образ PHP-FPM: `registry.zennex.ru/zennex/highlight:php`
   - ✅ Собран образ Nginx: `registry.zennex.ru/zennex/highlight:nginx`
   - ✅ Оба образа отправлены в Registry и доступны в GitLab Container Registry

#### 🔄 В процессе:
- Настройка структуры директорий на сервере

#### ⏳ Ожидает выполнения:
- Копирование манифестов k3s
- Настройка базы данных
- Создание Secret с переменными окружения
- Деплой приложения
- Выполнение миграций
- Проверка работоспособности

---

**Дата создания:** 2025-10-07
**Последнее обновление:** 2025-10-08
**Статус:** В процессе деплоя
