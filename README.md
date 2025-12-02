# BetPro - Монорепо

Проект BetPro - платформа для прогнозов на спорт, новостей и аналитики.

## Структура проекта

```
betpro/
├── frontend/     # React + TypeScript + Vite
├── backend/      # Node.js + TypeScript + Fastify
└── shared/       # Общие типы и утилиты
```

## Технологический стек

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- React Query (@tanstack/react-query)

### Backend
- Node.js
- TypeScript
- Fastify
- @fastify/cors
- Prisma ORM
- SQLite (для разработки, можно переключиться на PostgreSQL)

### Shared
- TypeScript типы для общих сущностей

## Установка

### Вариант 1: Использование npm workspaces (рекомендуется)

```bash
# Установка всех зависимостей
npm install

# Запуск frontend и backend одновременно
npm run dev

# Или отдельно:
npm run dev:frontend  # Запуск только frontend (порт 3000)
npm run dev:backend  # Запуск только backend (порт 3001)
```

### Вариант 2: Использование pnpm (рекомендуется для монорепо)

```bash
# Установка pnpm (если еще не установлен)
npm install -g pnpm

# Установка всех зависимостей
pnpm install

# Запуск frontend и backend одновременно
pnpm dev

# Или отдельно:
pnpm --filter betpro-frontend dev
pnpm --filter betpro-backend dev
```

## Разработка

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend доступен на http://localhost:3000

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend API доступен на http://localhost:3001

#### База данных

Проект использует Prisma ORM с SQLite для разработки.

**Первоначальная настройка:**

1. Установите зависимости (если еще не установлены):
```bash
cd backend
npm install
```

2. Создайте файл `.env` в папке `backend` (если его нет):
```bash
DATABASE_URL="file:./dev.db"
```

3. Сгенерируйте Prisma клиент:
```bash
cd backend
npm run db:generate
```

4. Примените миграции (создаст базу данных и таблицы):
```bash
cd backend
npm run db:migrate
```

Или используйте `db:push` для быстрой синхронизации схемы без миграций:
```bash
cd backend
npm run db:push
```

5. Заполните базу данных тестовыми данными:
```bash
cd backend
npm run db:seed
```

**Полезные команды:**

- `npm run db:generate` - Генерация Prisma клиента
- `npm run db:migrate` - Создание и применение миграций
- `npm run db:push` - Быстрая синхронизация схемы (без миграций)
- `npm run db:seed` - Заполнение БД тестовыми данными
- `npm run db:studio` - Открыть Prisma Studio (GUI для просмотра данных)

**Модели базы данных:**

- `Bookmaker` - Букмекерские конторы (name, rating, bonusAmount, tags, features)
- `Forecast` - Прогнозы на спорт (eventName, sport, tournament, expertName, odds, pick, comment)
- `News` - Новости (title, sport, category, imageUrl, teaser, sourceName, sourceUrl)
- `Article` - Статьи (title, level, tags, readTimeMinutes, contentShort, contentUrl)

Все модели включают стандартные поля: `id`, `createdAt`, `updatedAt`.

### API Endpoints

- `GET /api/bookmakers` - Список букмекеров
- `GET /api/bookmakers/:id` - Детали букмекера
- `GET /api/forecasts` - Список прогнозов
- `GET /api/forecasts/:id` - Детали прогноза
- `GET /api/news` - Список новостей
- `GET /api/news/:id` - Детали новости
- `GET /api/articles` - Список статей
- `GET /api/articles/:id` - Детали статьи
- `GET /health` - Health check

## Структура маршрутов Frontend

- `/` или `/bonuses` - Страница бонусов
- `/forecasts` - Страница прогнозов
- `/news` - Страница новостей
- `/articles` - Страница статей

## Сборка

```bash
# Сборка всех проектов
npm run build

# Сборка frontend
cd frontend && npm run build

# Сборка backend
cd backend && npm run build
```

## Следующие шаги

1. ✅ Скелет монорепо
2. ✅ Настройка базы данных (SQLite + Prisma)
3. ⏳ Реализация парсинга данных
4. ⏳ Полная реализация API
5. ⏳ Интеграция Frontend с Backend
6. ⏳ PWA функциональность
7. ⏳ Упаковка в APK (Capacitor)
