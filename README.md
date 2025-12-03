# Sports Betting App

Веб-приложение для спортивных ставок с прогнозами, новостями и бонусами от букмекеров.

## 🚀 Быстрый старт

### Для разработки (с локальным сервером)

1. **Установите зависимости:**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd "../Sports Betting App Design"
   npm install
   ```

2. **Запустите сервер:**
   ```bash
   cd server
   npm run dev
   ```

3. **Запустите фронтенд:**
   ```bash
   cd "Sports Betting App Design"
   npm run dev
   ```

### Для продакшена (с GitHub Actions)

1. **Настройте GitHub Actions** (см. [GITHUB_SETUP.md](./GITHUB_SETUP.md))
2. **Создайте `.env` файл:**
   ```env
   VITE_GITHUB_REPO=your-username/your-repo-name
   ```
3. **Соберите приложение:**
   ```bash
   cd "Sports Betting App Design"
   npm run build
   ```

## 📱 Создание APK

Для конвертации в Android APK используйте Capacitor:

1. Установите Capacitor:
   ```bash
   cd "Sports Betting App Design"
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init
   ```

2. Настройте GitHub для данных (см. [GITHUB_SETUP.md](./GITHUB_SETUP.md))

3. Соберите и откройте в Android Studio:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

Подробнее: см. инструкции по созданию APK

## 📚 Документация

- [SETUP.md](./SETUP.md) - Подробная инструкция по настройке
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Настройка GitHub Actions
- [server/README.md](./server/README.md) - Документация API

## 🎯 Особенности

- ✅ Автоматический парсинг прогнозов и новостей
- ✅ Работа через GitHub Actions (без сервера)
- ✅ Поддержка PWA
- ✅ Адаптивный дизайн
- ✅ Поддержка темной темы

## 🛠 Технологии

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express
- **Парсинг:** Cheerio + Axios
- **Стили:** Tailwind CSS
- **UI:** Radix UI

## 📝 Лицензия

MIT

