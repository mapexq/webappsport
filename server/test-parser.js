import { PredictionsParser } from './parsers/predictionsParser.js';

const parser = new PredictionsParser();

try {
  console.log('Начинаем парсинг прогнозов...');
  const predictions = await parser.parsePredictions();
  console.log(`Найдено прогнозов: ${predictions.length}`);
  
  predictions.forEach((pred, index) => {
    console.log(`\nПрогноз ${index + 1}:`);
    console.log(`  Эксперт: ${pred.expertName}`);
    console.log(`  Время: ${pred.timestamp}`);
    console.log(`  Заголовок: ${pred.title?.substring(0, 60)}...`);
    console.log(`  Прогноз: ${pred.prediction}`);
    console.log(`  Коэффициент: ${pred.odds}`);
    if (pred.matchInfo) {
      console.log(`  Матч: ${pred.matchInfo.teams}`);
    }
  });
} catch (error) {
  console.error('Ошибка при парсинге:', error);
}

