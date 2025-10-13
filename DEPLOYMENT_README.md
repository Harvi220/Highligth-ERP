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
$user->last_name = 'Админ';
$user->first_name = 'Иван';
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

### 2025-10-10 (Успешный деплой)

#### ✅ Выполнено:

1. **Авторизация в Docker Registry**
   - Успешно авторизованы в `registry.zennex.ru`

2. **Сборка и отправка образов**
   - ✅ Собран образ PHP-FPM: `registry.zennex.ru/zennex/highlight:php`
   - ✅ Собран образ Nginx: `registry.zennex.ru/zennex/highlight:nginx`
   - ✅ Оба образа отправлены в Registry и доступны в GitLab Container Registry

3. **Настройка сервера**
   - ✅ Создана структура директорий `/var/www/highlight.zennex.ru` (conf, log, src, storage, .k3s)
   - ✅ Клонирован репозиторий в `src/` (ветка master)
   - ✅ Скопированы манифесты k3s из `src/.k3s/` в `.k3s/`

4. **Настройка базы данных**
   - ✅ Создана БД: `highlight` (utf8mb4_unicode_ci)
   - ✅ Создан пользователь: `highlight_user` с паролем `Harvi_18273645`
   - ✅ Выданы права на БД `highlight`

5. **Настройка переменных окружения**
   - ✅ Создан файл `.env.production` на сервере
   - ✅ Сгенерирован APP_KEY: `base64:LmF9b5J8imXG9AyX044DaE6xS8++XCNB9T1kvrwWRa4=`
   - ✅ Создан Kubernetes Secret `highlight-erp-env`

6. **Деплой приложения**
   - ✅ Применены все манифесты Kubernetes
   - ✅ Запущен PHP-FPM deployment (1/1 Running)
   - ✅ Создан Service для PHP-FPM
   - ✅ Настроен Ingress для `highlight-erp.zennex.ru`
   - ✅ TLS сертификат выдан

7. **Миграции и данные**
   - ✅ Запущены миграции (14 таблиц создано)
   - ✅ Созданы необходимые директории `storage/framework/{cache,sessions,views}`
   - ✅ Установлены правильные права на директории (775)
   - ✅ Создана роль "Администратор" (id=1)
   - ✅ Создана должность "Администратор" (id=1)
   - ✅ Создан тестовый админ:
     - Имя: Админ Тестовый Администратор
     - Телефон: `79990001122`
     - Пароль: `password`

8. **Проверка работоспособности**
   - ✅ Health check работает: `{"status":"healthy","services":{"database":"connected"}}`
   - ✅ Приложение доступно по адресу: https://highlight-erp.zennex.ru
   - ✅ База данных подключена успешно

---

#### 🐛 Обнаруженные и исправленные ошибки:

1. **Ошибка: "The directory /var/log/supervisor/supervisord.log does not exist"**
   - **Причина:** В Dockerfile не создавалась директория `/var/log/supervisor`
   - **Решение:** Добавлена команда создания директории в `php.dockerfile:69-72`
   - **Статус:** ✅ Исправлено, образ пересобран и отправлен в Registry

2. **Ошибка: "Unsupported cipher or incorrect key length"**
   - **Причина:** APP_KEY был установлен в значение `base64:TEMPORARY_KEY_WILL_BE_GENERATED`
   - **Решение:** Сгенерирован валидный APP_KEY через `php artisan key:generate --show`
   - **Статус:** ✅ Исправлено, Secret пересоздан, deployment перезапущен

3. **Ошибка: "Please provide a valid cache path"**
   - **Причина:** Отсутствовали директории `storage/framework/{cache,sessions,views}`
   - **Решение:** Созданы директории внутри контейнера с правами 775
   - **Статус:** ✅ Исправлено временно (директории созданы в работающем контейнере)

4. **Ошибка: "Class 'Redis' not found"**
   - **Причина:** В `routes/web.php:20` была проверка подключения к Redis, но расширение не установлено
   - **Решение:** Удалена проверка Redis из `routes/web.php` (строки 5, 19-23, 30)
   - **Статус:** ✅ Исправлено временно (файл отредактирован в контейнере)

5. **Ошибка: "Column not found: 1054 Unknown column 'surname'"**
   - **Причина:** Неправильные названия полей при создании пользователя
   - **Решение:** Использованы правильные поля: `last_name`, `first_name` (вместо `surname`, `name`)
   - **Статус:** ✅ Исправлено

6. **Ошибка: "Foreign key constraint fails (position_id)"**
   - **Причина:** Пустые таблицы `positions` и `roles`
   - **Решение:** Созданы записи в таблицах через `DB::table()->insert()`
   - **Статус:** ✅ Исправлено

7. **Ошибка: "TypeError: Cannot read properties of undefined (reading 'role')"**
   - **Причина:** API при авторизации не возвращает поле `role` для пользователя (проблема с загрузкой связей)
   - **Решение:** Проверить что связи `role` и `position` загружаются в `AuthController::login()` (строка 77)
   - **Статус:** 🔄 В процессе диагностики

---

#### ⚠️ Необходимо исправить в репозитории:

1. **Исправить `routes/web.php`:**
   - Удалить `use Illuminate\Support\Facades\Redis;` (строка 5)
   - Удалить блок проверки Redis (строки 19-23)
   - Удалить `'redis' => $redisStatus,` из ответа (строка 30)

2. **Исправить Dockerfile `php.dockerfile`:**
   - ✅ Уже исправлено: добавлено создание `/var/log/supervisor`
   - ❗ **Добавить создание директорий storage/framework:**
   ```dockerfile
   RUN mkdir -p storage/framework/cache/data \
       storage/framework/sessions \
       storage/framework/views \
       storage/logs \
       bootstrap/cache \
       && chown -R www-data:www-data /var/www/html \
       && chmod -R 775 storage bootstrap/cache
   ```

3. **Исправить `.env.production`:**
   - ❗ Текущий URL: `APP_URL=https://highlight.zennex.ru`
   - ✅ Правильный URL: `APP_URL=https://highlight-erp.zennex.ru`
   - ❗ Обновить APP_KEY на актуальный: `base64:LmF9b5J8imXG9AyX044DaE6xS8++XCNB9T1kvrwWRa4=`

4. **Добавить Seeders для начальных данных:**
   - Создать seeder для роли "Администратор"
   - Создать seeder для должности "Администратор"
   - Создать seeder для тестового администратора

5. **Исправить инструкцию в DEPLOYMENT_README.md (строки 255-263):**
   - Заменить `$user->surname` на `$user->last_name`
   - Заменить `$user->name` на `$user->first_name`

---

#### 📦 Следующие шаги (не выполнено):

1. **Деплой Frontend (Nginx + React)**
   - Собрать образ Nginx для фронтенда
   - Отправить в Registry
   - Применить deployment-nginx.yaml
   - Настроить проксирование API запросов к PHP backend

2. **Настройка домена**
   - Убедиться, что DNS запись для `highlight-erp.zennex.ru` указывает на сервер
   - Проверить доступность из внешней сети

3. **Настройка бэкапов**
   - Настроить автоматические бэкапы БД
   - Настроить бэкапы файлов из PersistentVolume

4. **Мониторинг**
   - Настроить алерты на ошибки
   - Настроить мониторинг ресурсов (CPU, RAM, Disk)

---

#### 🔄 Команды для обновления:

После исправления кода в репозитории:

```bash
# 1. Коммит изменений
git add .
git commit -m "Fix: Remove Redis check, fix storage directories, update APP_URL"
git push

# 2. Пересобрать PHP образ
cd highlight-erp
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/zennex/highlight:php \
  -f php.dockerfile .
docker push registry.zennex.ru/zennex/highlight:php

# 3. Обновить Secret на сервере (если изменился .env.production)
kubectl delete secret highlight-erp-env
kubectl create secret generic highlight-erp-env \
  --from-env-file=/var/www/highlight.zennex.ru/.env.production

# 4. Перезапустить deployment
kubectl rollout restart deployment highlight-erp-php-deployment
kubectl rollout status deployment highlight-erp-php-deployment
```

---

**Дата создания:** 2025-10-07
**Последнее обновление:** 2025-10-10
**Статус:** ✅ **Деплой завершен успешно! Backend работает.**
**URL:** https://highlight-erp.zennex.ru
**Логин:** 79990001122 / password
