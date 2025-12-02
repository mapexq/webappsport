import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedForecast {
  id: string;
  sport: string;
  tournament: string | null;
  match: string | null;
  odds: number | null;
  ava: string | null;
  expertName: string;
  expertStatus: 'эксперт' | 'любитель';
  winrate: number;
  prediction: string;
  comment: string | null;
  fullText: string;
  sourceUrl: string;
  publishedAt: Date;
}

const SCRAPING_DELAY = parseInt(process.env.SCRAPING_DELAY || '3000', 10);
const LOG_DIR = path.join(process.cwd(), 'logs');

// Создаем директорию для логов если её нет
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, 'scraping.log');

function log(message: string, level: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

function generateId(title: string, date: Date): string {
  const hash = createHash('md5').update(`${title}-${date.toISOString()}`).digest('hex');
  return hash.substring(0, 16);
}

function generateWinrate(): number {
  // Генерируем случайный винрейт от 60 до 85%
  return Math.round((Math.random() * 25 + 60) * 100) / 100;
}

function parseDate(dateStr: string): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Обработка "Сегодня • HH:MM"
  if (dateStr.includes('Сегодня')) {
    const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const date = new Date(today);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }
  
  // Обработка "Вчера • HH:MM"
  if (dateStr.includes('Вчера')) {
    const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const date = new Date(today);
      date.setDate(date.getDate() - 1);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }
  
  // Обработка "Через X минут/часов"
  if (dateStr.includes('Через')) {
    return now; // Используем текущее время
  }
  
  return now;
}

function determineExpertStatus(expertName: string, context: string): 'эксперт' | 'любитель' {
  // Определяем статус на основе имени и контекста
  const expertKeywords = ['эксперт', 'комментатор', 'тренер', 'профессионал', 'мастер'];
  const lowerContext = context.toLowerCase();
  
  // Проверяем контекст
  for (const keyword of expertKeywords) {
    if (lowerContext.includes(keyword)) {
      return 'эксперт';
    }
  }
  
  // По умолчанию считаем экспертом (так как на сайте в основном эксперты)
  return 'эксперт';
}

export async function scrapeForecasts(url: string = 'https://bookmaker-ratings.ru/forecast_homepage/'): Promise<ParsedForecast[]> {
  try {
    log(`Начинаю парсинг прогнозов с ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    const forecasts: ParsedForecast[] = [];
    
    // Ищем блоки с прогнозами
    // На основе анализа структуры сайта, прогнозы находятся в main контенте
    // Попробуем несколько селекторов
    const forecastBlocks = $('main article, main [class*="tip"], main [class*="forecast"], main [class*="prediction"]');
    
    if (forecastBlocks.length === 0) {
      // Альтернативный подход - ищем по структуре ссылок
      const forecastLinks = $('a[href*="/tips/"]').slice(0, 20);
      
      log(`Найдено ${forecastLinks.length} ссылок на прогнозы, парсим детали...`);
      
      for (let i = 0; i < Math.min(forecastLinks.length, 10); i++) {
        const link = forecastLinks.eq(i);
        const href = link.attr('href');
        
        if (!href) continue;
        
        const fullUrl = href.startsWith('http') ? href : `https://bookmaker-ratings.ru${href}`;
        
        try {
          // Парсим информацию из карточки на главной странице
          const card = link.closest('div, article, section');
          
          // Извлекаем данные из карточки
          const expertName = card.find('[class*="expert"], [class*="author"]').first().text().trim() || 
                           card.find('strong, b').first().text().trim() || 
                           'Неизвестный эксперт';
          
          const title = link.text().trim() || card.find('h2, h3, [class*="title"]').first().text().trim();
          
          // Ищем текст анализа
          const comment = card.find('p').first().text().trim() || '';
          
          // Ищем информацию о матче
          const matchInfo = card.find('[class*="match"], [class*="event"]').first().text().trim();
          
          // Ищем коэффициент
          const oddsText = card.find('[class*="odds"], [class*="coef"], [class*="coefficient"]').first().text().trim();
          const odds = oddsText ? parseFloat(oddsText.replace(',', '.')) : null;
          
          // Ищем тип ставки
          const prediction = card.find('[class*="prediction"], [class*="pick"], [class*="bet"]').first().text().trim() || 
                           card.find('strong, b').last().text().trim() || 
                           'Не указано';
          
          // Ищем дату
          const dateText = card.find('time, [class*="date"], [class*="time"]').first().text().trim() || 
                          card.find('[class*="timestamp"]').first().text().trim() || 
                          'Сегодня • 12:00';
          
          const publishedAt = parseDate(dateText);
          
          // Определяем спорт и турнир из контекста
          const sport = extractSport(title, comment);
          const tournament = extractTournament(title, comment, matchInfo);
          const match = extractMatch(matchInfo, title);
          
          // Генерируем ID
          const id = generateId(title, publishedAt);
          
          // Ищем аватар
          const avatar = card.find('img[src*="avatar"], img[src*="expert"], img[alt*="эксперт"]').first().attr('src') || null;
          const ava = avatar ? (avatar.startsWith('http') ? avatar : `https://bookmaker-ratings.ru${avatar}`) : null;
          
          const forecast: ParsedForecast = {
            id,
            sport,
            tournament,
            match,
            odds,
            ava,
            expertName: expertName || 'Неизвестный эксперт',
            expertStatus: determineExpertStatus(expertName, comment + ' ' + title),
            winrate: generateWinrate(),
            prediction: prediction || 'Не указано',
            comment: comment || null,
            fullText: card.text().trim(),
            sourceUrl: fullUrl,
            publishedAt,
          };
          
          forecasts.push(forecast);
          
          // Задержка между запросами
          if (i < Math.min(forecastLinks.length, 10) - 1) {
            await new Promise(resolve => setTimeout(resolve, SCRAPING_DELAY));
          }
        } catch (error) {
          log(`Ошибка при парсинге прогноза ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
      }
    } else {
      // Парсим блоки напрямую
      forecastBlocks.slice(0, 10).each((index, element) => {
        try {
          const $el = $(element);
          
          const expertName = $el.find('[class*="expert"], [class*="author"]').first().text().trim() || 
                           $el.find('strong, b').first().text().trim() || 
                           'Неизвестный эксперт';
          
          const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
          const comment = $el.find('p').first().text().trim() || '';
          const matchInfo = $el.find('[class*="match"], [class*="event"]').first().text().trim();
          
          const oddsText = $el.find('[class*="odds"], [class*="coef"]').first().text().trim();
          const odds = oddsText ? parseFloat(oddsText.replace(',', '.')) : null;
          
          const prediction = $el.find('[class*="prediction"], [class*="pick"]').first().text().trim() || 'Не указано';
          
          const dateText = $el.find('time, [class*="date"]').first().text().trim() || 'Сегодня • 12:00';
          const publishedAt = parseDate(dateText);
          
          const sport = extractSport(title, comment);
          const tournament = extractTournament(title, comment, matchInfo);
          const match = extractMatch(matchInfo, title);
          
          const id = generateId(title, publishedAt);
          
          const avatar = $el.find('img').first().attr('src') || null;
          const ava = avatar ? (avatar.startsWith('http') ? avatar : `https://bookmaker-ratings.ru${avatar}`) : null;
          
          const forecast: ParsedForecast = {
            id,
            sport,
            tournament,
            match,
            odds,
            ava,
            expertName: expertName || 'Неизвестный эксперт',
            expertStatus: determineExpertStatus(expertName, comment + ' ' + title),
            winrate: generateWinrate(),
            prediction: prediction || 'Не указано',
            comment: comment || null,
            fullText: $el.text().trim(),
            sourceUrl: url,
            publishedAt,
          };
          
          forecasts.push(forecast);
        } catch (error) {
          log(`Ошибка при парсинге блока ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
      });
    }
    
    log(`Успешно распарсено ${forecasts.length} прогнозов`);
    return forecasts.slice(0, 10); // Возвращаем только топ-10
    
  } catch (error) {
    log(`Критическая ошибка при парсинге: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    throw error;
  }
}

function extractSport(title: string, comment: string): string {
  const text = (title + ' ' + comment).toLowerCase();
  
  const sports = {
    'футбол': ['футбол', 'football', 'фб', 'soccer'],
    'хоккей': ['хоккей', 'hockey', 'нхл', 'кхл'],
    'теннис': ['теннис', 'tennis'],
    'баскетбол': ['баскетбол', 'basketball', 'нба', 'nba'],
    'киберспорт': ['киберспорт', 'esport', 'cs', 'dota'],
    'бокс': ['бокс', 'boxing'],
    'мма': ['мма', 'mma', 'ufc'],
  };
  
  for (const [sport, keywords] of Object.entries(sports)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return sport.charAt(0).toUpperCase() + sport.slice(1);
    }
  }
  
  return 'Другое';
}

function extractTournament(title: string, comment: string, matchInfo: string): string | null {
  const text = (title + ' ' + comment + ' ' + matchInfo).toLowerCase();
  
  const tournaments = [
    'Премьер-лига', 'АПЛ', 'Ла Лига', 'Серия А', 'Бундеслига', 'Лига 1',
    'РПЛ', 'КХЛ', 'НХЛ', 'Евролига', 'NBA', 'Еврокубок', 'Лига чемпионов',
    'Кубок', 'Чемпионат', 'Турнир'
  ];
  
  for (const tournament of tournaments) {
    if (text.includes(tournament.toLowerCase())) {
      return tournament;
    }
  }
  
  return null;
}

function extractMatch(matchInfo: string, title: string): string | null {
  // Ищем паттерн "Команда1 - Команда2" или "Команда1 vs Команда2"
  const matchPattern = /([А-Яа-яA-Za-z\s]+)\s*[-—vs]\s*([А-Яа-яA-Za-z\s]+)/;
  const text = matchInfo || title;
  const match = text.match(matchPattern);
  
  if (match) {
    return `${match[1].trim()} vs ${match[2].trim()}`;
  }
  
  return null;
}

// Мок-функция для тестирования
export function getMockForecasts(): ParsedForecast[] {
  const now = new Date();
  return [
    {
      id: generateId('Манчестер Сити - Ливерпуль', now),
      sport: 'Футбол',
      tournament: 'АПЛ',
      match: 'Манчестер Сити vs Ливерпуль',
      odds: 1.85,
      ava: 'https://example.com/avatar1.jpg',
      expertName: 'Дмитрий Волков',
      expertStatus: 'эксперт',
      winrate: 73.5,
      prediction: 'Обе забьют: Да',
      comment: 'Оба клуба показывают отличную атакующую игру.',
      fullText: 'Полный анализ матча...',
      sourceUrl: 'https://bookmaker-ratings.ru/forecast_homepage/',
      publishedAt: now,
    },
    // Добавим еще 9 прогнозов для полноты
    ...Array.from({ length: 9 }, (_, i) => ({
      id: generateId(`Прогноз ${i + 2}`, new Date(now.getTime() + i * 60000)),
      sport: ['Футбол', 'Хоккей', 'Теннис', 'Баскетбол'][i % 4],
      tournament: ['АПЛ', 'КХЛ', 'ATP', 'NBA'][i % 4],
      match: `Команда ${i + 1} vs Команда ${i + 2}`,
      odds: 1.5 + Math.random() * 1.5,
      ava: null,
      expertName: `Эксперт ${i + 1}`,
      expertStatus: (i % 2 === 0 ? 'эксперт' : 'любитель') as 'эксперт' | 'любитель',
      winrate: generateWinrate(),
      prediction: `Прогноз ${i + 1}`,
      comment: `Комментарий к прогнозу ${i + 1}`,
      fullText: `Полный текст прогноза ${i + 1}`,
      sourceUrl: 'https://bookmaker-ratings.ru/forecast_homepage/',
      publishedAt: new Date(now.getTime() + i * 60000),
    })),
  ];
}

