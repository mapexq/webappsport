import { scrapeForecasts, getMockForecasts } from '../scrapers/forecastScraper.js';
import { forecastRepository } from '../repositories/forecast.repository.js';
import { prisma } from '../lib/prisma.js';

const USE_MOCK = process.env.USE_MOCK === 'true';

async function main() {
  try {
    console.log('🚀 Начинаю парсинг прогнозов...');
    
    let forecasts;
    
    if (USE_MOCK) {
      console.log('📝 Используются мок-данные');
      forecasts = getMockForecasts();
    } else {
      console.log('🌐 Парсинг с сайта bookmaker-ratings.ru...');
      forecasts = await scrapeForecasts();
    }
    
    if (forecasts.length === 0) {
      console.log('⚠️  Не удалось получить прогнозы, используем мок-данные');
      forecasts = getMockForecasts();
    }
    
    console.log(`✅ Получено ${forecasts.length} прогнозов`);
    
    // Удаляем все существующие прогнозы
    console.log('🗑️  Удаляю старые прогнозы...');
    await forecastRepository.deleteAll();
    
    // Преобразуем распарсенные прогнозы в формат БД
    const forecastsToSave = forecasts.map(forecast => ({
      eventName: forecast.match || `${forecast.sport} матч`,
      sport: forecast.sport,
      tournament: forecast.tournament || null,
      match: forecast.match || null,
      expertName: forecast.expertName,
      expertAvatarUrl: forecast.ava || null,
      expertLevel: forecast.expertStatus === 'эксперт' ? 'Эксперт' : 'Любитель',
      expertStatus: forecast.expertStatus,
      odds: forecast.odds || null,
      pick: forecast.prediction || 'Не указано',
      prediction: forecast.prediction || null,
      winrate: forecast.winrate || null,
      comment: forecast.comment || null,
      fullText: forecast.fullText || null,
      sourceName: 'Bookmaker Ratings',
      sourceUrl: forecast.sourceUrl,
      publishedAt: forecast.publishedAt,
    }));
    
    // Сохраняем новые прогнозы
    console.log('💾 Сохраняю прогнозы в БД...');
    const count = await forecastRepository.createMany(forecastsToSave);
    
    console.log(`✅ Успешно сохранено ${count} прогнозов`);
    
    // Если сохранилось меньше 10, заполняем мок-данными
    if (count < 10) {
      console.log('📝 Дополняю до 10 прогнозов мок-данными...');
      const mockForecasts = getMockForecasts().slice(0, 10 - count);
      const mockToSave = mockForecasts.map(forecast => ({
        eventName: forecast.match || `${forecast.sport} матч`,
        sport: forecast.sport,
        tournament: forecast.tournament || null,
        match: forecast.match || null,
        expertName: forecast.expertName,
        expertAvatarUrl: forecast.ava || null,
        expertLevel: forecast.expertStatus === 'эксперт' ? 'Эксперт' : 'Любитель',
        expertStatus: forecast.expertStatus,
        odds: forecast.odds || null,
        pick: forecast.prediction || 'Не указано',
        prediction: forecast.prediction || null,
        winrate: forecast.winrate || null,
        comment: forecast.comment || null,
        fullText: forecast.fullText || null,
        sourceName: 'Bookmaker Ratings',
        sourceUrl: forecast.sourceUrl,
        publishedAt: forecast.publishedAt,
      }));
      
      const additionalCount = await forecastRepository.createMany(mockToSave);
      console.log(`✅ Дополнительно сохранено ${additionalCount} прогнозов`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при парсинге прогнозов:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

