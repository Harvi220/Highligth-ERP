# 🚀 Чеклист развертывания Highlight ERP

## ✅ Что было сделано (Доработки перед деплоем)

### 1. Исправления архитектуры
- ✅ Добавлен Nginx в PHP контейнер для обработки Laravel запросов
- ✅ Настроен Supervisor для одновременного запуска PHP-FPM и Nginx
- ✅ Создана конфигурация `nginx-laravel.conf` для обработки Laravel маршрутов
- ✅ Обновлен `php.dockerfile` для включения Nginx и Supervisor

### 2. Конфигурация фронтенда
- ✅ Исправлен hardcoded API URL → используется `VITE_API_URL` из переменных окружения
- ✅ Создан `.env.production` с `VITE_API_URL=/api`
- ✅ Создан `.env.development` с `VITE_API_URL=http://localhost:8000/api`
- ✅ Обновлен `nginx.conf` для проксирования `/api/` и `/storage/` к PHP сервису

### 3. Kubernetes конфигурация
- ✅ Обновлен `deployment-php.yaml`:
  - Добавлен порт 80 (HTTP) к контейнеру
  - Изменены health check пробы на HTTP `/api/health`
- ✅ Обновлен `service-php.yaml`: добавлен порт 80 для HTTP трафика
- ✅ Конфигурация Ingress без изменений (уже корректна)

### 4. Backend доработки
- ✅ Добавлен health check endpoint `/api/health` в `routes/api.php`
- ✅ Обновлен `.env.production.example`:
  - DB_CONNECTION изменен на `mysql` (было `pgsql`)
  - DB_HOST изменен на `mysql-service`
  - Добавлен `ASSET_URL`
  - Упрощены настройки кеша (file вместо redis)

### 5. Безопасность
- ✅ Создан корневой `.gitignore` для защиты `.env.production`
- ✅ Обновлен `.gitignore` фронтенда для защиты environment файлов

---

## 📋 План действий по деплою

### Предварительные проверки

#### ☐ 1. Проверить наличие доступов
```bash
# Проверить доступ к серверу
ssh root@zennex.ru -p 333

# Проверить доступ к GitLab Registry
docker login registry.zennex.ru
# Логин: techuser
# Пароль: [запросить у администратора]
```

#### ☐ 2. Проверить состояние кластера k3s
```bash
ssh root@zennex.ru -p 333
kubectl get nodes
kubectl get pods -A
kubectl get services -A | grep mysql
```

---

### Этап 1: Подготовка и сборка образов

#### ☐ 3. Закоммитить все изменения
```bash
cd D:\Highlight_ERP
git status
git add .
git commit -m "Подготовка к production деплою: архитектурные изменения"
git push origin master
```

#### ☐ 4. Авторизоваться в GitLab Registry (локально)
```bash
docker login registry.zennex.ru
```

#### ☐ 5. Собрать и отправить PHP образ
```bash
cd D:\Highlight_ERP\highlight-erp

# Сборка
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/php:latest \
  -f php.dockerfile .

# Отправка
docker push registry.zennex.ru/highlight-erp/php:latest
```

#### ☐ 6. Собрать и отправить Nginx образ
```bash
cd D:\Highlight_ERP\highlight-erp_front

# Сборка
docker build --no-cache --platform linux/amd64 \
  -t registry.zennex.ru/highlight-erp/nginx:latest \
  -f nginx.dockerfile .

# Отправка
docker push registry.zennex.ru/highlight-erp/nginx:latest
```

---

### Этап 2: Подготовка сервера

#### ☐ 7. Подключиться к серверу
```bash
ssh root@zennex.ru -p 333
```

#### ☐ 8. Создать структуру директорий
```bash
cd /var/www/
mkdir -p highlight-erp.zennex.ru/src
mkdir -p highlight-erp.zennex.ru/.k3s
mkdir -p highlight-erp.zennex.ru/storage
mkdir -p highlight-erp.zennex.ru/conf
```

#### ☐ 9. Клонировать репозиторий
```bash
cd /var/www/highlight-erp.zennex.ru/src
git clone [URL_РЕПОЗИТОРИЯ] .
# Точка в конце важна!
```

#### ☐ 10. Скопировать манифесты k3s
```bash
cp -r /var/www/highlight-erp.zennex.ru/src/.k3s/* /var/www/highlight-erp.zennex.ru/.k3s/
```

---

### Этап 3: Настройка базы данных

#### ☐ 11. Подключиться к MySQL pod
```bash
kubectl exec -it mysql-0 -- bash
mysql -u root_zennex -p
```

#### ☐ 12. Создать БД и пользователя
```sql
-- Создать БД
CREATE DATABASE highlight_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создать пользователя (ЗАМЕНИТЕ ПАРОЛЬ!)
CREATE USER 'highlight_erp_user'@'%' IDENTIFIED BY 'ВАШ_СИЛЬНЫЙ_ПАРОЛЬ';

-- Выдать права
GRANT ALL PRIVILEGES ON highlight_erp.* TO 'highlight_erp_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### ☐ 13. Выйти из pod
```bash
exit
```

---

### Этап 4: Конфигурация переменных окружения

#### ☐ 14. Создать .env.production на сервере
```bash
cd /var/www/highlight-erp.zennex.ru
nano .env.production
```

#### ☐ 15. Заполнить .env.production (на основе .env.production.example)
```env
APP_NAME="Highlight ERP"
APP_ENV=production
APP_KEY=  # Будет сгенерирован позже
APP_DEBUG=false
APP_URL=https://highlight-erp.zennex.ru
ASSET_URL=https://highlight-erp.zennex.ru

DB_CONNECTION=mysql
DB_HOST=mysql-service
DB_PORT=3306
DB_DATABASE=highlight_erp
DB_USERNAME=highlight_erp_user
DB_PASSWORD=ВАШ_СИЛЬНЫЙ_ПАРОЛЬ  # Из шага 12

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

LOG_CHANNEL=stack
LOG_LEVEL=error

FILESYSTEM_DISK=public

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@highlight-erp.zennex.ru"
MAIL_FROM_NAME="Highlight ERP"
```

#### ☐ 16. Сгенерировать APP_KEY
```bash
# Временно запустить PHP контейнер для генерации ключа
docker run --rm registry.zennex.ru/highlight-erp/php:latest php artisan key:generate --show

# Скопировать сгенерированный ключ и вставить в .env.production
nano .env.production
# Обновить APP_KEY=base64:...
```

#### ☐ 17. Создать Kubernetes Secret
```bash
kubectl create secret generic highlight-erp-env \
  --from-env-file=/var/www/highlight-erp.zennex.ru/.env.production
```

#### ☐ 18. Проверить Secret
```bash
kubectl get secrets | grep highlight-erp
```

---

### Этап 5: Деплой приложения

#### ☐ 19. Применить манифесты k3s
```bash
cd /var/www/highlight-erp.zennex.ru/.k3s
kubectl apply -f .
```

#### ☐ 20. Проверить статус подов
```bash
kubectl get pods -w
# Ожидать статус Running для обоих подов
# Ctrl+C для выхода из режима watch
```

#### ☐ 21. При ошибках проверить логи
```bash
# Список подов
kubectl get pods | grep highlight-erp

# Логи PHP пода
kubectl logs <highlight-erp-php-pod-name>

# Логи Nginx пода
kubectl logs <highlight-erp-nginx-pod-name>

# Детальное описание пода
kubectl describe pod <pod-name>
```

---

### Этап 6: Миграции и начальные данные

#### ☐ 22. Подключиться к PHP pod
```bash
kubectl exec -it <highlight-erp-php-pod-name> -- bash
```

#### ☐ 23. Запустить миграции
```bash
cd /var/www/html
php artisan migrate --force
```

#### ☐ 24. Создать тестового администратора
```bash
php artisan tinker
```

В tinker:
```php
$user = new App\Models\User();
$user->surname = 'Администратор';
$user->name = 'Системный';
$user->patronymic = 'Пользователь';
$user->phone = '79990001122';
$user->password = bcrypt('SecurePassword123!');
$user->position_id = 1;  // Проверить, что должность существует
$user->role_id = 1;       // 1 = Admin
$user->save();
exit
```

#### ☐ 25. Создать должности (если нужно)
```bash
php artisan tinker
```

В tinker:
```php
App\Models\Position::create(['name' => 'Администратор']);
App\Models\Position::create(['name' => 'Менеджер']);
App\Models\Position::create(['name' => 'Сотрудник']);
exit
```

#### ☐ 26. Выйти из pod
```bash
exit
```

---

### Этап 7: Проверка работоспособности

#### ☐ 27. Проверить все ресурсы
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

#### ☐ 28. Проверить SSL сертификат
```bash
kubectl describe ingress highlight-erp-ingress
# Должен быть статус: Certificate issued
```

#### ☐ 29. Проверить доступность в браузере
- Открыть: https://highlight-erp.zennex.ru
- Должна открыться страница логина

#### ☐ 30. Проверить API health check
```bash
curl https://highlight-erp.zennex.ru/api/health
# Ожидается: {"status":"ok"}
```

#### ☐ 31. Выполнить тестовый вход
- Телефон: `79990001122`
- Пароль: `SecurePassword123!` (или тот, что задали)
- Проверить, что загружается главная страница

#### ☐ 32. Проверить загрузку документов
- Попробовать создать документ
- Проверить, что файл загружается
- Проверить, что файл доступен для скачивания

---

### Этап 8: Мониторинг и логи

#### ☐ 33. Проверить логи PHP
```bash
kubectl logs -f <php-pod-name>
```

#### ☐ 34. Проверить логи Nginx (фронтенд)
```bash
kubectl logs -f <nginx-pod-name>
```

#### ☐ 35. Проверить использование ресурсов
```bash
kubectl top pods | grep highlight-erp
kubectl top nodes
```

---

## 🔄 Обновление приложения (в будущем)

### Быстрое обновление
```bash
# Локально
git add .
git commit -m "Описание изменений"
git push

# Пересобрать образы
cd highlight-erp
docker build --no-cache --platform linux/amd64 -t registry.zennex.ru/highlight-erp/php:latest -f php.dockerfile .
docker push registry.zennex.ru/highlight-erp/php:latest

cd ../highlight-erp_front
docker build --no-cache --platform linux/amd64 -t registry.zennex.ru/highlight-erp/nginx:latest -f nginx.dockerfile .
docker push registry.zennex.ru/highlight-erp/nginx:latest

# На сервере
ssh root@zennex.ru -p 333
kubectl rollout restart deployment highlight-erp-php-deployment
kubectl rollout restart deployment highlight-erp-nginx-deployment
kubectl rollout status deployment highlight-erp-php-deployment
```

---

## 🛠️ Полезные команды

### Логи
```bash
kubectl logs -f <pod-name>                    # Логи в реальном времени
kubectl logs <pod-name> --tail=100            # Последние 100 строк
kubectl logs <pod-name> --tail=100 | grep ERROR  # Фильтр по ERROR
```

### Подключение к контейнеру
```bash
kubectl exec -it <pod-name> -- bash
```

### Масштабирование
```bash
kubectl scale deployment highlight-erp-php-deployment --replicas=2
```

### Откат деплоя
```bash
kubectl rollout undo deployment highlight-erp-php-deployment
kubectl rollout undo deployment highlight-erp-nginx-deployment
```

### Очистка кэша Laravel (внутри pod)
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## ⚠️ Важные замечания

### Безопасность
- ❗ `.env.production` НЕ ДОЛЖЕН быть в Git (уже в .gitignore)
- ❗ Используйте сильные пароли для БД (минимум 16 символов)
- ❗ Регулярно обновляйте зависимости
- ❗ Делайте бэкапы БД перед миграциями

### Бэкапы
- БД автоматически бэкапится в `/var/backups/mysql_serivice_databases`
- Настройте бэкапы файлов из PersistentVolume

### Мониторинг
- Проверяйте логи на ошибки ежедневно
- Мониторьте использование ресурсов (CPU, RAM, Disk)
- Настройте алерты для критических ошибок

---

## 🐛 Решение типовых проблем

### Pod не запускается (ErrImagePull)
```bash
# Проверить registry-secret
kubectl get secrets | grep registry

# Пересоздать secret если нужно
kubectl delete secret registry-secret
kubectl create secret docker-registry registry-secret \
  --docker-server=registry.zennex.ru \
  --docker-username=techuser \
  --docker-password=YOUR_PASSWORD
```

### База данных не подключается
```bash
# Проверить mysql-service
kubectl get services -A | grep mysql

# Проверить логи PHP pod
kubectl logs <php-pod-name> | grep -i database

# Проверить переменные окружения в pod
kubectl exec -it <php-pod-name> -- env | grep DB_
```

### SSL сертификат не выдается
```bash
# Проверить cert-manager
kubectl get certificaterequest
kubectl describe certificate highlight-erp-tls

# Логи cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

### Файлы не загружаются
```bash
# Проверить права на storage
kubectl exec -it <php-pod-name> -- bash
ls -la /var/www/html/storage/app
chmod -R 775 /var/www/html/storage
chown -R www-data:www-data /var/www/html/storage

# Проверить PVC
kubectl get pvc
kubectl describe pvc highlight-erp-storage-pvc
```

---

**Дата создания:** 2025-10-07
**Версия:** 1.0
**Статус:** ✅ Готово к деплою
