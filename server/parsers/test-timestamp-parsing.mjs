/**
 * Тестовый скрипт для проверки парсинга времени
 */

import { findTimestampInCard, parseTimestampToDate, isValidTimestamp } from './timestampUtils.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

console.log('Тестирование парсинга времени...\n');

// Тестируем валидацию
const testCases = [
  'Сегодня • 14:07',
  'Вчера • 15:30',
  '1 Дек • 12:47',
  '2 часа назад',
  '30 минут назад',
  'Недавно',
  'invalid'
];

console.log('Тест валидации:');
testCases.forEach(test => {
  const valid = isValidTimestamp(test);
  console.log(`  "${test}" -> ${valid ? '✓' : '✗'}`);
});

console.log('\nТест парсинга:');
testCases.filter(isValidTimestamp).forEach(test => {
  const date = parseTimestampToDate(test);
  console.log(`  "${test}" -> ${date.toISOString()}`);
});

// Тестируем реальный парсинг с сайта
console.log('\nТест реального парсинга с сайта...');
try {
  const response = await axios.get('https://bookmaker-ratings.ru/forecast_homepage/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  // Ищем первую карточку прогноза
  const $firstCard = $('div').filter((i, el) => {
    const text = $(el).text();
    return text.includes('прогноз') && text.includes('ставка') && text.length > 200;
  }).first();
  
  if ($firstCard.length > 0) {
    const timestamp = findTimestampInCard($firstCard, $);
    console.log(`Найденная временная метка: "${timestamp}"`);
    
    if (timestamp) {
      const date = parseTimestampToDate(timestamp);
      console.log(`Распарсенная дата: ${date.toISOString()}`);
    } else {
      console.log('⚠️ Временная метка не найдена');
      
      // Показываем текст карточки для отладки
      const cardText = $firstCard.text().substring(0, 500);
      console.log('\nТекст карточки (первые 500 символов):');
      console.log(cardText);
    }
  } else {
    console.log('⚠️ Карточка прогноза не найдена');
  }
} catch (error) {
  console.error('Ошибка при тестировании:', error.message);
}



