import { RbcNewsScraper } from '../parsers/rbcNewsScraper.js';
import { NewsStorage } from '../data/newsStorage.js';

/**
 * CLI команда для парсинга новостей
 * Использование: node scripts/scrape-news.js
 * или через yarn: yarn scrape:news
 */
async function scrapeNews() {
  try {
    console.log('🚀 Запуск парсинга новостей с sportrbc.ru...\n');

    const scraper = new RbcNewsScraper();
    const storage = new NewsStorage();

    // Парсим новости
    const news = await scraper.scrapeRbcNews();
    console.log(`✅ Спарсено новостей: ${news.length}\n`);

    // Удаляем старые новости
    storage.deleteAllNews();
    console.log('🗑️  Старые новости удалены\n');

    // Сохраняем новые
    const saved = storage.addNews(news);
    if (saved) {
      console.log(`💾 Сохранено новостей: ${news.length}\n`);
      console.log('📰 Список новостей:');
      news.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.sport})`);
      });
      console.log('\n✅ Парсинг завершён успешно!');
    } else {
      console.error('❌ Ошибка при сохранении новостей');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка при парсинге новостей:', error);
    process.exit(1);
  }
}

// Запуск
scrapeNews();

