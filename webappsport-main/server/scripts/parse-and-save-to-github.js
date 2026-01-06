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

console.log('📂 Рабочая директория:', process.cwd());
console.log('📂 Корень репозитория:', REPO_ROOT);
console.log('📂 Папка для данных:', DATA_DIR);

// Создаем папку data, если её нет
if (!fs.existsSync(DATA_DIR)) {
  console.log('📁 Создаём папку data...');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✅ Папка data создана');
} else {
  console.log('✅ Папка data уже существует');
}

async function parseAndSave() {
  let predictions = [];
  let news = [];
  
  try {
    console.log('\n🚀 Начало парсинга данных...\n');

    // 1. Парсим прогнозы
    console.log('📊 Парсинг прогнозов...');
    try {
      const predictionsParser = new PredictionsParser();
      const rawPredictions = await predictionsParser.parsePredictions();
      console.log(`   Получено сырых прогнозов: ${rawPredictions.length}`);
      
      if (!rawPredictions || rawPredictions.length === 0) {
        console.warn('⚠️ Не получено ни одного прогноза, используем пустой массив');
        predictions = [];
      } else {
        const formattedPredictions = predictionsParser.formatPredictions(rawPredictions);
        predictions = formattedPredictions.slice(0, 10);
        console.log(`   Отформатировано прогнозов: ${predictions.length}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при парсинге прогнозов:', error.message);
      console.error('   Stack:', error.stack);
      // Продолжаем с пустым массивом
      predictions = [];
    }

    // Сохраняем прогнозы (даже если пустой массив)
    const predictionsPath = path.join(DATA_DIR, 'predictions.json');
    fs.writeFileSync(
      predictionsPath,
      JSON.stringify(predictions, null, 2),
      'utf-8'
    );
    console.log(`✅ Сохранено прогнозов: ${predictions.length}`);

    // 2. Парсим новости
    console.log('\n📰 Парсинг новостей...');
    try {
      const rbcNewsScraper = new RbcNewsScraper();
      const scrapedNews = await rbcNewsScraper.scrapeRbcNews();
      console.log(`   Получено новостей: ${scrapedNews.length}`);
      
      if (!scrapedNews || scrapedNews.length === 0) {
        console.warn('⚠️ Не получено ни одной новости, используем пустой массив');
        news = [];
      } else {
        news = scrapedNews.slice(0, 10);
        
        // Сортируем новости по дате публикации (новые первыми)
        news.sort((a, b) => {
          try {
            const dateA = new Date(a.publishedAt || 0);
            const dateB = new Date(b.publishedAt || 0);
            return dateB - dateA;
          } catch (e) {
            return 0;
          }
        });
        console.log(`   Отобрано новостей: ${news.length}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при парсинге новостей:', error.message);
      console.error('   Stack:', error.stack);
      // Продолжаем с пустым массивом
      news = [];
    }

    // Сохраняем новости (даже если пустой массив)
    const newsPath = path.join(DATA_DIR, 'news.json');
    fs.writeFileSync(
      newsPath,
      JSON.stringify(news, null, 2),
      'utf-8'
    );
    console.log(`✅ Сохранено новостей: ${news.length}`);

    // 3. Сохраняем метаданные о времени обновления
    const metadata = {
      lastUpdate: new Date().toISOString(),
      predictionsCount: predictions.length,
      newsCount: news.length,
      success: true,
    };
    const metadataPath = path.join(DATA_DIR, 'metadata.json');
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
    console.log(`✅ Метаданные сохранены`);

    console.log('\n✅ Все данные успешно сохранены!');
    console.log(`📁 Данные сохранены в: ${DATA_DIR}`);
    console.log(`🕐 Время обновления: ${metadata.lastUpdate}`);

    // Проверяем, что файлы действительно созданы
    const files = ['predictions.json', 'news.json', 'metadata.json'];
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ✓ ${file}: ${stats.size} bytes`);
      } else {
        console.error(`   ✗ ${file}: файл не найден!`);
      }
    }

    return {
      success: true,
      predictions: predictions.length,
      news: news.length,
    };
  } catch (error) {
    console.error('\n❌ Критическая ошибка при парсинге данных:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Сохраняем метаданные с ошибкой
    try {
      const metadata = {
        lastUpdate: new Date().toISOString(),
        predictionsCount: predictions.length,
        newsCount: news.length,
        success: false,
        error: error.message,
      };
      const metadataPath = path.join(DATA_DIR, 'metadata.json');
      fs.writeFileSync(
        metadataPath,
        JSON.stringify(metadata, null, 2),
        'utf-8'
      );
    } catch (saveError) {
      console.error('   Не удалось сохранить метаданные об ошибке:', saveError.message);
    }
    
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

