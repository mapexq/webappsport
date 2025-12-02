import express from 'express';
import cors from 'cors';
import { PredictionsParser } from './parsers/predictionsParser.js';
import { NewsParser } from './parsers/newsParser.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Хранилище прогнозов (в продакшене использовать БД)
let cachedPredictions = [];
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Инициализация парсеров
const predictionsParser = new PredictionsParser();
const newsParser = new NewsParser();

/**
 * GET /api/predictions
 * Получает последние 10 прогнозов
 */
app.get('/api/predictions', async (req, res) => {
  try {
    // Проверяем кэш
    const now = Date.now();
    if (cachedPredictions.length > 0 && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return res.json(cachedPredictions);
    }

    // Парсим прогнозы
    console.log('Парсинг прогнозов...');
    const rawPredictions = await predictionsParser.parsePredictions();
    
    // Форматируем в нужный формат
    const formattedPredictions = predictionsParser.formatPredictions(rawPredictions);
    
    // Сохраняем только последние 10
    cachedPredictions = formattedPredictions.slice(0, 10);
    lastFetchTime = now;
    
    console.log(`Получено ${cachedPredictions.length} прогнозов`);
    res.json(cachedPredictions);
  } catch (error) {
    console.error('Ошибка при получении прогнозов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении прогнозов',
      message: error.message 
    });
  }
});

/**
 * POST /api/predictions/refresh
 * Принудительное обновление прогнозов
 */
app.post('/api/predictions/refresh', async (req, res) => {
  try {
    console.log('Принудительное обновление прогнозов...');
    
    // Очищаем кэш
    lastFetchTime = null;
    
    // Парсим прогнозы
    const rawPredictions = await predictionsParser.parsePredictions();
    
    // Форматируем в нужный формат
    const formattedPredictions = predictionsParser.formatPredictions(rawPredictions);
    
    // Сохраняем только последние 10 (удаляем старые, добавляем новые)
    cachedPredictions = formattedPredictions.slice(0, 10);
    lastFetchTime = Date.now();
    
    console.log(`Обновлено ${cachedPredictions.length} прогнозов`);
    res.json({
      success: true,
      predictions: cachedPredictions,
      count: cachedPredictions.length
    });
  } catch (error) {
    console.error('Ошибка при обновлении прогнозов:', error);
    res.status(500).json({ 
      error: 'Ошибка при обновлении прогнозов',
      message: error.message 
    });
  }
});

/**
 * GET /api/news
 * Получает последние новости
 */
app.get('/api/news', async (req, res) => {
  try {
    console.log('Парсинг новостей...');
    const news = await newsParser.parseNews();
    console.log(`Получено ${news.length} новостей`);
    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении новостей',
      message: error.message 
    });
  }
});

/**
 * GET /api/health
 * Проверка здоровья сервера
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    cachedPredictions: cachedPredictions.length
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу http://localhost:${PORT}/api`);
});

