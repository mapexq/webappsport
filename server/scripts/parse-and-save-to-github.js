import { PredictionsParser } from '../parsers/predictionsParser.js';
import { RbcNewsScraper } from '../parsers/rbcNewsScraper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Скрипт для парсинга и сохранения данных в JSON файлы
 * Используется GitHub Actions для автоматического обновления данных
 * 
 * Сохраняет данные в папку data/ в корне репозитория для доступа через GitHub Pages
 */

// Путь к папке data в корне репозитория (для GitHub Pages)
const REPO_ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(REPO_ROOT, 'data');

// Создаем папку data, если её нет
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function parseAndSave() {
  try {
    console.log('🚀 Начало парсинга данных...\n');

    // 1. Парсим прогнозы
    console.log('📊 Парсинг прогнозов...');
    const predictionsParser = new PredictionsParser();
    const rawPredictions = await predictionsParser.parsePredictions();
    const formattedPredictions = predictionsParser.formatPredictions(rawPredictions);
    const predictions = formattedPredictions.slice(0, 10);

    // Сохраняем прогнозы
    const predictionsPath = path.join(DATA_DIR, 'predictions.json');
    fs.writeFileSync(
      predictionsPath,
      JSON.stringify(predictions, null, 2),
      'utf-8'
    );
    console.log(`✅ Сохранено прогнозов: ${predictions.length}`);

    // 2. Парсим новости
    console.log('\n📰 Парсинг новостей...');
    const rbcNewsScraper = new RbcNewsScraper();
    const news = await rbcNewsScraper.scrapeRbcNews();
    const latestNews = news.slice(0, 10);

    // Сортируем новости по дате публикации (новые первыми)
    latestNews.sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB - dateA;
    });

    // Сохраняем новости
    const newsPath = path.join(DATA_DIR, 'news.json');
    fs.writeFileSync(
      newsPath,
      JSON.stringify(latestNews, null, 2),
      'utf-8'
    );
    console.log(`✅ Сохранено новостей: ${latestNews.length}`);

    // 3. Сохраняем метаданные о времени обновления
    const metadata = {
      lastUpdate: new Date().toISOString(),
      predictionsCount: predictions.length,
      newsCount: latestNews.length,
    };
    const metadataPath = path.join(DATA_DIR, 'metadata.json');
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    console.log('\n✅ Все данные успешно сохранены!');
    console.log(`📁 Данные сохранены в: ${DATA_DIR}`);
    console.log(`🕐 Время обновления: ${metadata.lastUpdate}`);

    return {
      success: true,
      predictions: predictions.length,
      news: latestNews.length,
    };
  } catch (error) {
    console.error('❌ Ошибка при парсинге данных:', error);
    throw error;
  }
}

// Запуск
parseAndSave()
  .then((result) => {
    console.log('\n🎉 Парсинг завершён успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });

