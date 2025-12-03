# Инструкция по настройке и запуску

## Шаг 1: Установка зависимостей backend

```bash
cd server
npm install
```

## Шаг 2: Запуск backend сервера

```bash
cd server
npm start
# или для разработки с автоперезагрузкой:
npm run dev
```

Сервер запустится на `http://localhost:3001`

## Шаг 3: Настройка фронтенда

Создайте файл `.env` в папке `Sports Betting App Design/`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Шаг 4: Запуск фронтенда

```bash
cd "Sports Betting App Design"
npm run dev
```

## Как это работает

1. **Парсинг прогнозов**: Backend сервер парсит сайт `https://bookmaker-ratings.ru/forecast_homepage/` и извлекает последние 10 прогнозов
2. **Структура данных**: Все данные сохраняются в том же формате, что и в дизайне:
   - Название спорта (discipline)
   - Матч/турнир (tournament)
   - Кто играет (eventName)
   - Коэффициент (odds)
   - Аватар эксперта (expert.avatar)
   - Имя эксперта (expert.name)
   - Статус "Эксперт" (expert.status)
   - Винрейт (expert.winRate) - генерируется случайно от 68 до 89
   - Прогноз (prediction)
   - Комментарий (comment)
3. **Обновление**: 
   - При загрузке приложения автоматически загружаются последние 10 прогнозов
   - При нажатии кнопки обновления старые прогнозы удаляются, добавляются новые последние 10
4. **Кэширование**: Прогнозы кэшируются на 5 минут для уменьшения нагрузки на сайт

## Разделение парсеров

- **PredictionsParser** (`server/parsers/predictionsParser.js`) - парсит прогнозы
- **NewsParser** (`server/parsers/newsParser.js`) - парсит новости (отдельный промпт)

## API Endpoints

- `GET /api/predictions` - получить последние 10 прогнозов
- `POST /api/predictions/refresh` - принудительное обновление (удаляет старые, добавляет новые)
- `GET /api/news` - получить новости
- `GET /api/health` - проверка здоровья сервера

