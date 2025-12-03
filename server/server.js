import express from 'express';
import cors from 'cors';
import { PredictionsParser } from './parsers/predictionsParser.js';
import { NewsParser } from './parsers/newsParser.js';
import { RbcNewsScraper } from './parsers/rbcNewsScraper.js';
import { NewsStorage } from './data/newsStorage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const rbcNewsScraper = new RbcNewsScraper();
const newsStorage = new NewsStorage();

// Логирование
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function logNewsScraping(message, error = null) {
  const logFile = path.join(LOG_DIR, 'news-scraping.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${error ? `\nError: ${error.stack || error.message}` : ''}\n`;
  
  try {
    fs.appendFileSync(logFile, logMessage, 'utf-8');
  } catch (err) {
    console.error('Ошибка записи в лог:', err);
  }
  
  if (error) {
    console.error(message, error);
  } else {
    console.log(message);
  }
}

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
 * Получает последние 10 новостей из БД
 */
app.get('/api/news', async (req, res) => {
  try {
    const news = newsStorage.readNews();
    // НЕ сортируем - возвращаем в том порядке, в котором сохранены
    // Порядок уже установлен при сохранении (по publishedAt DESC)
    res.json(news);
  } catch (error) {
    logNewsScraping('Ошибка при получении новостей из БД', error);
    res.status(500).json({ 
      error: 'Ошибка при получении новостей',
      message: error.message 
    });
  }
});

/**
 * POST /api/news/refresh
 * Запускает парсинг sportrbc.ru, удаляет старые новости, сохраняет новые 10
 */
app.post('/api/news/refresh', async (req, res) => {
  try {
    logNewsScraping('Запуск парсинга новостей с sportrbc.ru...');
    
    // Парсим новости
    let scrapedNews = [];
    try {
      scrapedNews = await rbcNewsScraper.scrapeRbcNews();
      logNewsScraping(`Спарсено новостей: ${scrapedNews.length}`);
    } catch (scrapingError) {
      logNewsScraping('Ошибка при парсинге sportrbc.ru', scrapingError);
      
      // Возвращаем старые данные из БД, если парсинг не удался
      const existingNews = newsStorage.readNews();
      return res.json({
        success: false,
        error: 'Не удалось обновить новости',
        message: scrapingError.message,
        count: existingNews.length,
        news: existingNews
      });
    }

    // Получаем старые новости для сравнения
    const existingNews = newsStorage.readNews();
    
    // Создаем Map для быстрого поиска старых новостей по URL
    const existingNewsMap = new Map();
    existingNews.forEach(news => {
      existingNewsMap.set(news.sourceUrl, news);
    });
    
    // Создаем Map для новых новостей по URL
    const newNewsMap = new Map();
    scrapedNews.slice(0, 10).forEach(news => {
      newNewsMap.set(news.sourceUrl, news);
    });
    
    // Определяем, какие новости новые, а какие старые
    const newNewsUrls = new Set();
    const oldNewsUrls = new Set();
    
    newNewsMap.forEach((news, url) => {
      if (existingNewsMap.has(url)) {
        oldNewsUrls.add(url);
      } else {
        newNewsUrls.add(url);
      }
    });
    
    // Если все новости те же самые (нет новых), сохраняем старый порядок
    if (newNewsUrls.size === 0 && oldNewsUrls.size === existingNews.length && existingNews.length === scrapedNews.slice(0, 10).length) {
      logNewsScraping('Новости не изменились, сохраняем старый порядок');
      // Возвращаем старые новости без изменений (не обновляем файл и updatedAt)
      res.json({
        success: true,
        count: existingNews.length,
        news: existingNews,
        updated: false
      });
      return;
    }
    
    // Если есть новые новости или изменился состав, обновляем
    // Сортируем новые новости по publishedAt DESC
    const sortedNewNews = scrapedNews.slice(0, 10).sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );
    
    // Удаляем все старые новости
    newsStorage.deleteAllNews();
    
    // Сохраняем новые (максимум 10)
    newsStorage.addNews(sortedNewNews);
    
    logNewsScraping(`Сохранено новостей: ${sortedNewNews.length} (новых: ${newNewsUrls.size})`);
    
    res.json({
      success: true,
      count: sortedNewNews.length,
      news: sortedNewNews,
      updated: true
    });
  } catch (error) {
    logNewsScraping('Ошибка при обновлении новостей', error);
    
    // Возвращаем старые данные
    const existingNews = newsStorage.readNews();
    res.status(500).json({ 
      success: false,
      error: 'Ошибка при обновлении новостей',
      message: error.message,
      count: existingNews.length,
      news: existingNews
    });
  }
});

/**
 * GET /api/news/last-update
 * Возвращает timestamp последнего обновления
 */
app.get('/api/news/last-update', (req, res) => {
  try {
    const lastUpdate = newsStorage.getLastUpdate();
    res.json({ 
      lastUpdate: lastUpdate || new Date().toISOString()
    });
  } catch (error) {
    logNewsScraping('Ошибка при получении времени последнего обновления', error);
    res.status(500).json({ 
      error: 'Ошибка при получении времени обновления',
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

