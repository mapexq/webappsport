import { scrapeRbcNews, getMockNews } from '../scrapers/rbcNewsScraper.js';
import { newsRepository } from '../repositories/news.repository.js';
import { prisma } from '../lib/prisma.js';

async function main() {
  try {
    console.log('🚀 Запуск парсинга новостей с sportrbc.ru...\n');

    // Используем мок-данные если указано в env
    const useMock = process.env.USE_MOCK_NEWS === 'true';
    let parsedNews;

    if (useMock) {
      console.log('📝 Используются мок-данные для тестирования\n');
      parsedNews = getMockNews();
    } else {
      console.log('🌐 Парсинг новостей с https://sportrbc.ru...\n');
      parsedNews = await scrapeRbcNews();
    }

    if (!parsedNews || parsedNews.length === 0) {
      console.error('❌ Не удалось спарсить новости');
      process.exit(1);
    }

    console.log(`✅ Успешно распарсено ${parsedNews.length} новостей\n`);

    // Удаляем все существующие новости
    console.log('🗑️  Удаление старых новостей...');
    await newsRepository.deleteAll();
    console.log('✅ Старые новости удалены\n');

    // Преобразуем ParsedNews в формат для БД
    const newsData = parsedNews.map(item => ({
      id: item.id,
      title: item.title,
      sport: item.sport,
      category: item.category,
      imageUrl: item.imageUrl,
      teaser: item.teaser,
      fullContent: item.fullContent,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt,
    }));

    // Добавляем новые новости
    console.log('💾 Сохранение новостей в базу данных...');
    const createdCount = await newsRepository.createMany(newsData);
    console.log(`✅ Сохранено ${createdCount} новостей\n`);

    // Выводим список сохраненных новостей
    console.log('📰 Список сохраненных новостей:');
    parsedNews.forEach((news, index) => {
      console.log(`\n${index + 1}. ${news.title}`);
      console.log(`   Спорт: ${news.sport}`);
      console.log(`   Категория: ${news.category || 'Не указана'}`);
      console.log(`   Дата: ${news.publishedAt.toLocaleString('ru-RU')}`);
      console.log(`   URL: ${news.sourceUrl}`);
    });

    console.log('\n✨ Парсинг завершен успешно!');
  } catch (error) {
    console.error('❌ Ошибка при парсинге новостей:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

