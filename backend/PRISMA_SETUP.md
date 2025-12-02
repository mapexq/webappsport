# Настройка Prisma и базы данных

## Быстрый старт

1. **Установите зависимости:**
```bash
cd backend
npm install
```

2. **Создайте файл `.env`** (если его нет):
```bash
DATABASE_URL="file:./dev.db"
```

3. **Сгенерируйте Prisma клиент:**
```bash
npm run db:generate
```

4. **Примените миграции:**
```bash
npm run db:migrate
```

Или используйте быструю синхронизацию (без миграций):
```bash
npm run db:push
```

5. **Заполните БД тестовыми данными:**
```bash
npm run db:seed
```

6. **Запустите сервер:**
```bash
npm run dev
```

## Модели базы данных

### Bookmaker
- `id` (UUID)
- `name` (String)
- `rating` (Float)
- `bonusAmount` (String, optional)
- `tags` (String - JSON array)
- `features` (String - JSON array)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Forecast
- `id` (UUID)
- `eventName` (String)
- `sport` (String)
- `tournament` (String, optional)
- `expertName` (String)
- `expertAvatarUrl` (String, optional)
- `expertLevel` (String, optional)
- `odds` (Float)
- `pick` (String)
- `comment` (String, optional)
- `sourceName` (String, optional)
- `sourceUrl` (String, optional)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### News
- `id` (UUID)
- `title` (String)
- `sport` (String, optional)
- `category` (String, optional)
- `imageUrl` (String, optional)
- `teaser` (String, optional)
- `sourceName` (String, optional)
- `sourceUrl` (String, optional)
- `publishedAt` (DateTime, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Article
- `id` (UUID)
- `title` (String)
- `level` (String, optional)
- `tags` (String - JSON array)
- `readTimeMinutes` (Int, optional)
- `contentShort` (String, optional)
- `contentUrl` (String, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Полезные команды

- `npm run db:generate` - Генерация Prisma клиента
- `npm run db:migrate` - Создание и применение миграций
- `npm run db:push` - Быстрая синхронизация схемы
- `npm run db:seed` - Заполнение БД тестовыми данными
- `npm run db:studio` - Открыть Prisma Studio (GUI)

## Переключение на PostgreSQL

Если нужно использовать PostgreSQL вместо SQLite:

1. Обновите `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Обновите `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/betpro?schema=public"
```

3. Примените миграции:
```bash
npm run db:migrate
```

