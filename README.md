# 🏢 Highlight ERP

**Highlight ERP** — это современная система управления документооборотом предприятия с автоматической конвертацией документов в PDF и удобным интерфейсом для администраторов и сотрудников.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Требования](#-требования)
- [Быстрый старт](#-быстрый-старт)
- [Разработка](#-разработка)
- [Production развертывание](#-production-развертывание)
- [Структура проекта](#-структура-проекта)
- [API документация](#-api-документация)
- [Тестовые данные](#-тестовые-данные)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Вклад в проект](#-вклад-в-проект)
- [Лицензия](#-лицензия)

---

## ✨ Возможности

### Для администраторов
- 📄 **Управление документами**: Загрузка, редактирование, удаление документов (PDF, DOCX, XLSX)
- 🔄 **Автоматическая конвертация**: Office документы автоматически конвертируются в PDF через LibreOffice
- 👥 **Управление сотрудниками**: CRUD операции, назначение должностей
- 📊 **Статистика**: Просмотр статуса ознакомления сотрудников с документами
- 🔍 **PDF просмотр**: Встроенный просмотрщик PDF с навигацией по страницам
- 📥 **Скачивание**: Возможность скачать любой документ

### Для сотрудников
- 📋 **Список документов**: Просмотр назначенных документов
- 📖 **Чтение документов**: Встроенный PDF viewer с удобной навигацией
- ✅ **Подтверждение ознакомления**: Отметка о прочтении документа
- 📥 **Скачивание**: Сохранение документов локально

### Технические возможности
- 🔐 **Аутентификация**: Laravel Sanctum (Bearer Token)
- 🚀 **Производительность**: OPcache, Redis cache, Queue workers
- 🐳 **Docker**: Production-ready контейнеризация
- 📱 **Адаптивность**: Responsive дизайн для мобильных устройств
- 🔒 **Безопасность**: Security headers, CORS, валидация данных

---

## 🛠️ Технологический стек

### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.2+
- **Database**: PostgreSQL 16 / MySQL 8.0
- **Cache**: Redis 7
- **Queue**: Redis Queue
- **Auth**: Laravel Sanctum
- **API Docs**: L5-Swagger (OpenAPI)
- **Document Processing**: LibreOffice (headless)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 6
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **PDF Viewer**: react-pdf (PDF.js)
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Alpine)
- **Process Manager**: PHP-FPM
- **Orchestration**: Make commands

---

## 📦 Требования

### Для разработки
- **PHP**: 8.2 или выше
- **Composer**: 2.x
- **Node.js**: 20.x или выше
- **NPM**: 10.x или выше
- **PostgreSQL**: 16.x или MySQL 8.0
- **Redis**: 7.x
- **LibreOffice**: Для конвертации документов

### Для production (Docker)
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **RAM**: 4GB минимум, 8GB рекомендуется
- **Storage**: 20GB+ свободного места

---

## 🚀 Быстрый старт

### Вариант 1: Docker (Рекомендуется для production)

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/highlight-erp.git
cd highlight-erp

# 2. Создать .env файл
cp .env.production.example .env
nano .env  # Установить APP_KEY, DB_PASSWORD, REDIS_PASSWORD

# 3. Запустить автоматическую установку
make install

# 4. Готово! Приложение доступно:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

**Подробнее**: См. [DOCKER_README.md](./DOCKER_README.md) и [DEPLOYMENT.md](./DEPLOYMENT.md)

### Вариант 2: Локальная разработка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/highlight-erp.git
cd highlight-erp
```

#### Backend Setup

```bash
cd highlight-erp

# Установить зависимости
composer install

# Создать .env файл
cp .env.example .env

# Настроить базу данных в .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=highlight_erp
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Настроить Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Сгенерировать ключ приложения
php artisan key:generate

# Выполнить миграции
php artisan migrate

# Создать storage link
php artisan storage:link

# Запустить сервер
composer run dev
```

Backend будет доступен на: http://localhost:8000

#### Frontend Setup

```bash
cd highlight-erp_front

# Установить зависимости
npm install

# Создать .env.local файл
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Запустить dev сервер
npm run dev
```

Frontend будет доступен на: http://localhost:5173

---

## 💻 Разработка

### Backend команды

```bash
cd highlight-erp

# Запустить все dev сервисы (Laravel + Queue + Logs + Vite)
composer run dev

# Запустить отдельные сервисы
php artisan serve              # Web сервер
php artisan queue:listen       # Queue worker
php artisan pail --timeout=0   # Real-time логи

# Миграции
php artisan migrate            # Выполнить
php artisan migrate:rollback   # Откатить
php artisan migrate:fresh      # Пересоздать (удаляет данные!)

# Кеширование
php artisan config:cache       # Закешировать конфигурацию
php artisan route:cache        # Закешировать маршруты
php artisan view:cache         # Закешировать представления

# Тестирование
php artisan test              # Все тесты
php artisan test --coverage   # С coverage

# Code style
./vendor/bin/pint             # Автофикс стиля кода
```

### Frontend команды

```bash
cd highlight-erp_front

# Разработка
npm run dev                    # Dev сервер с HMR

# Сборка
npm run build                  # Production build
npm run preview                # Preview production build

# Проверка кода
npm run lint                   # ESLint
npx tsc --noEmit              # TypeScript проверка типов
```

### Структура БД

```bash
# Создать новую миграцию
php artisan make:migration create_table_name

# Создать модель с миграцией
php artisan make:model ModelName -m

# Создать seeder
php artisan make:seeder TableSeeder

# Выполнить seeders
php artisan db:seed
php artisan db:seed --class=UserSeeder
```

---

## 🐳 Production развертывание

### Quick Deploy

```bash
# 1. Подготовить .env
cp .env.production.example .env
nano .env

# 2. Запустить
make production-deploy

# 3. Проверить статус
make health
```

### Управление через Makefile

```bash
# Основные команды
make up              # Запустить все контейнеры
make down            # Остановить все контейнеры
make restart         # Перезапустить
make logs            # Все логи
make logs-app        # Логи Laravel
make logs-frontend   # Логи Frontend

# Laravel команды
make migrate         # Выполнить миграции
make cache-clear     # Очистить кеши
make cache-optimize  # Оптимизировать кеши
make artisan cmd="route:list"

# Shell доступ
make shell-app       # Shell в Laravel контейнер
make shell-db        # Shell в PostgreSQL
make shell-redis     # Shell в Redis

# Backup/Restore
make backup-db       # Создать backup БД
make restore-db file=backup.sql

# Обслуживание
make clean           # Удалить контейнеры и volumes
make health          # Проверить статус сервисов
```

**Подробнее**: См. [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📁 Структура проекта

```
Highlight_ERP/
│
├── highlight-erp/                    # Backend (Laravel)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── Admin/      # Админ контроллеры
│   │   │   │   │   └── Employee/   # Контроллеры сотрудника
│   │   │   ├── Requests/            # Form requests
│   │   │   └── Resources/           # API resources
│   │   ├── Models/                  # Eloquent модели
│   │   ├── Repositories/            # Repository pattern
│   │   └── Services/
│   │       └── DocumentConversionService.php  # LibreOffice конвертация
│   ├── database/
│   │   └── migrations/              # Миграции БД
│   ├── routes/
│   │   ├── api.php                  # API маршруты
│   │   └── web.php                  # Web маршруты + health check
│   ├── storage/
│   │   └── app/public/documents/    # Загруженные документы
│   ├── docker/                      # Docker конфигурация
│   └── Dockerfile
│
├── highlight-erp_front/              # Frontend (React)
│   ├── src/
│   │   ├── components/              # Переиспользуемые компоненты
│   │   │   ├── PDFViewer/          # PDF просмотрщик
│   │   │   ├── DocumentCard/       # Карточка документа
│   │   │   ├── UserHeader/         # Хедер пользователя
│   │   │   └── ProtectedRoute/     # Защита маршрутов
│   │   ├── pages/                   # Страницы
│   │   │   ├── LoginPage/
│   │   │   ├── DocumentsPage/      # Страница сотрудника
│   │   │   ├── DocumentViewPage/   # Просмотр PDF (сотрудник)
│   │   │   ├── AdminDocumentsPage/
│   │   │   ├── AdminDocumentViewPage/  # Просмотр PDF (админ)
│   │   │   ├── AdminEmployeesPage/
│   │   │   └── AdminEmployeeStatsPage/
│   │   ├── services/                # API клиенты
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   ├── adminDocuments.ts
│   │   │   └── adminEmployees.ts
│   │   ├── store/                   # Zustand stores
│   │   ├── types/                   # TypeScript типы
│   │   └── utils/
│   │       └── pdfConfig.ts        # PDF.js конфигурация
│   ├── public/
│   │   └── pdf.worker.min.mjs      # PDF.js worker
│   ├── docker/                      # Docker конфигурация
│   └── Dockerfile
│
├── docker-compose.yml                # Оркестрация сервисов
├── Makefile                          # Команды управления
├── .env.production.example           # Production конфигурация
├── README.md                         # Этот файл
├── DEPLOYMENT.md                     # Детальное руководство
└── DOCKER_README.md                  # Docker справка
```

---

## 📚 API документация

### Swagger UI

После запуска приложения, Swagger документация доступна по адресу:

```
http://localhost:8000/api/documentation
```

### Основные endpoints

#### Аутентификация

```http
POST /api/login
Content-Type: application/json

{
  "phone": "79991112233",
  "password": "password"
}

Response:
{
  "token": "1|xxxxxxxxxxxxx",
  "user": { ... }
}
```

#### Документы (Сотрудник)

```http
# Список документов
GET /api/employee/documents
Authorization: Bearer {token}

# Содержимое документа
GET /api/employee/documents/{id}/content
Authorization: Bearer {token}

# Скачать документ
GET /api/employee/documents/{id}/download
Authorization: Bearer {token}

# Отметить как прочитанный
POST /api/employee/documents/{id}/read
Authorization: Bearer {token}
```

#### Документы (Администратор)

```http
# Список документов
GET /api/admin/documents
Authorization: Bearer {token}

# Создать документ
POST /api/admin/documents
Content-Type: multipart/form-data
Authorization: Bearer {token}

title: "Название документа"
description: "Описание"
file: [binary]
is_for_all_employees: true

# Содержимое документа
GET /api/admin/documents/{id}/content
Authorization: Bearer {token}

# Скачать документ
GET /api/admin/documents/{id}/download
Authorization: Bearer {token}
```

---

## 🔑 Тестовые данные

### Учетные записи

После выполнения миграций создайте тестовые учетные данные или используйте seeder:

#### Администратор
- **Телефон**: `79990001122`
- **Пароль**: `password`

#### Сотрудник
- **Телефон**: `79991112233`
- **Пароль**: `password`

### Создание тестовых пользователей

```bash
# Запустить tinker
php artisan tinker

# Создать администратора
$admin = User::create([
    'first_name' => 'Админ',
    'last_name' => 'Система',
    'phone' => '79990001122',
    'password' => bcrypt('password'),
    'role_id' => 1, // admin role
    'position_id' => 1
]);

# Создать сотрудника
$employee = User::create([
    'first_name' => 'Петр',
    'last_name' => 'Петров',
    'middle_name' => 'Петрович',
    'phone' => '79991112233',
    'password' => bcrypt('password'),
    'role_id' => 2, // employee role
    'position_id' => 2
]);
```

---

## 🐛 Troubleshooting

### Backend ошибки

#### 1. Ошибка "Class not found"
```bash
# Очистить и пересоздать autoload
composer dump-autoload
php artisan clear-compiled
```

#### 2. Ошибка миграции
```bash
# Откатить и выполнить заново
php artisan migrate:rollback
php artisan migrate

# Или полностью пересоздать (удалит данные!)
php artisan migrate:fresh
```

#### 3. LibreOffice не работает
```bash
# Проверить установку
soffice --version

# Установить на Linux
sudo apt-get install libreoffice

# Установить на macOS
brew install --cask libreoffice

# Установить на Windows
# Скачать с https://www.libreoffice.org/download/
```

#### 4. Ошибка прав доступа
```bash
# Исправить права на storage
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Frontend ошибки

#### 1. PDF не отображается
```bash
# Проверить наличие worker файла
ls -la public/pdf.worker.min.mjs

# Пересоздать если отсутствует
cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

#### 2. CORS ошибки
```bash
# Проверить .env файл backend
FRONTEND_URL=http://localhost:5173

# Проверить config/cors.php
'allowed_origins' => ['*'], // Для dev

# Для production использовать конкретный домен
'allowed_origins' => ['https://your-domain.com'],
```

#### 3. Ошибки сборки
```bash
# Очистить node_modules и пересобрать
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker ошибки

#### 1. Порт уже занят
```bash
# Изменить порты в .env
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

#### 2. База данных не доступна
```bash
# Проверить логи
docker-compose logs db

# Пересоздать volume (ОСТОРОЖНО: удалит данные!)
docker-compose down -v
docker volume rm highlight_erp_postgres_data
make up
```

**Подробнее**: См. раздел Troubleshooting в [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🗺️ Roadmap

### v1.1 (Q1 2025)
- [ ] Email уведомления о новых документах
- [ ] Расширенная статистика и отчеты
- [ ] Экспорт статистики в Excel
- [ ] Массовое назначение документов

### v1.2 (Q2 2025)
- [ ] Электронная подпись документов
- [ ] История изменений документов
- [ ] Комментарии к документам
- [ ] Версионирование документов

### v2.0 (Q3 2025)
- [ ] Мобильное приложение (React Native)
- [ ] Интеграция с Active Directory
- [ ] SSO (Single Sign-On)
- [ ] Multi-tenancy

---

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста, следуйте этим рекомендациям:

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Code Style

- **Backend**: Laravel Pint (автоматически)
- **Frontend**: ESLint + Prettier

```bash
# Автофикс стиля
./vendor/bin/pint        # Backend
npm run lint             # Frontend
```

---

## 📞 Контакты и поддержка

- **Email**: support@highlight-erp.com
- **Issues**: [GitHub Issues](https://github.com/your-org/highlight-erp/issues)
- **Documentation**: [Wiki](https://github.com/your-org/highlight-erp/wiki)

---

## 📄 Лицензия

Proprietary - All rights reserved © 2025 Highlight ERP

---

## 🙏 Благодарности

- [Laravel](https://laravel.com/) - PHP фреймворк
- [React](https://react.dev/) - UI библиотека
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS фреймворк
- [LibreOffice](https://www.libreoffice.org/) - Document conversion
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering

---

<div align="center">

**Сделано с ❤️ командой Highlight ERP**

[⬆ Вернуться к началу](#-highlight-erp)

</div>
