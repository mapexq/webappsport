import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedNews {
  id: string;
  title: string;
  sport: string;
  category: string | null;
  imageUrl: string;
  teaser: string;
  fullContent?: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: Date;
}

const SCRAPING_DELAY = parseInt(process.env.SCRAPING_DELAY || '3000', 10);
const LOG_DIR = path.join(process.cwd(), 'logs');

// Создаем директорию для логов если её нет
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, 'news-scraping.log');

function log(message: string, level: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

// Массив User-Agent для ротации
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function generateId(title: string, publishedAt: Date): string {
  const hash = createHash('md5').update(`${title}-${publishedAt.toISOString()}`).digest('hex');
  return hash.substring(0, 16);
}

function normalizeSport(sportText: string): string {
  const text = sportText.toLowerCase().trim();
  
  const sportMap: Record<string, string> = {
    'футбол': 'Футбол',
    'football': 'Футбол',
    'хоккей': 'Хоккей',
    'hockey': 'Хоккей',
    'теннис': 'Теннис',
    'tennis': 'Теннис',
    'баскетбол': 'Баскетбол',
    'basketball': 'Баскетбол',
    'бокс': 'Единоборства',
    'boxing': 'Единоборства',
    'мма': 'Единоборства',
    'mma': 'Единоборства',
    'ufc': 'Единоборства',
    'единоборства': 'Единоборства',
  };
  
  for (const [key, value] of Object.entries(sportMap)) {
    if (text.includes(key)) {
      return value;
    }
  }
  
  return 'Другое';
}

function extractSport(categoryText: string, title: string, teaser: string): string {
  const combinedText = `${categoryText} ${title} ${teaser}`.toLowerCase();
  return normalizeSport(combinedText);
}

function parseDate(dateText: string): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Обработка "Сегодня • HH:MM" или "Сегодня, HH:MM"
  if (dateText.includes('Сегодня') || dateText.includes('сегодня')) {
    const timeMatch = dateText.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const date = new Date(today);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }
  
  // Обработка "Вчера • HH:MM" или "Вчера, HH:MM"
  if (dateText.includes('Вчера') || dateText.includes('вчера')) {
    const timeMatch = dateText.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const date = new Date(today);
      date.setDate(date.getDate() - 1);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }
  
  // Обработка "DD.MM.YYYY HH:MM" или "DD.MM.YYYY"
  const dateMatch = dateText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    const year = parseInt(dateMatch[3], 10);
    const hours = dateMatch[4] ? parseInt(dateMatch[4], 10) : 12;
    const minutes = dateMatch[5] ? parseInt(dateMatch[5], 10) : 0;
    return new Date(year, month, day, hours, minutes, 0, 0);
  }
  
  // Обработка "X минут/часов назад"
  const agoMatch = dateText.match(/(\d+)\s+(минут|часов|часа|минуты|час)\s+назад/);
  if (agoMatch) {
    const amount = parseInt(agoMatch[1], 10);
    const unit = agoMatch[2];
    const date = new Date(now);
    if (unit.includes('час')) {
      date.setHours(date.getHours() - amount);
    } else if (unit.includes('минут')) {
      date.setMinutes(date.getMinutes() - amount);
    }
    return date;
  }
  
  return now;
}

function extractTeaser(content: string, maxLength: number = 150): string {
  if (!content) return '';
  
  // Убираем лишние пробелы и переносы строк
  const cleaned = content.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Ищем первое предложение или обрезаем до maxLength
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]/);
  if (firstSentence && firstSentence[0].length <= maxLength) {
    return firstSentence[0].trim();
  }
  
  // Обрезаем до последнего пробела перед maxLength
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

const PLACEHOLDER_IMAGE = '/images/news-placeholder.jpg';

export async function scrapeRbcNews(url: string = 'https://sportrbc.ru'): Promise<ParsedNews[]> {
  try {
    log(`Начинаю парсинг новостей с ${url}`);
    
    // Задержка перед парсингом
    await new Promise(resolve => setTimeout(resolve, SCRAPING_DELAY));
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    const news: ParsedNews[] = [];
    
    // Пробуем различные селекторы для поиска новостей
    // Типичные селекторы для sportrbc.ru:
    // - .news-item, .article-item, .news-card
    // - article[class*="news"], article[class*="article"]
    // - .feed-item, .list-item
    // - [data-news-id], [data-article-id]
    
    let newsItems = $('.news-item, .article-item, .news-card, article[class*="news"], article[class*="article"], .feed-item, .list-item');
    
    // Если не нашли, пробуем более общие селекторы
    if (newsItems.length === 0) {
      // Ищем ссылки на новости
      const newsLinks = $('a[href*="/news/"], a[href*="/article/"], a[href*="/sport/"]');
      log(`Найдено ${newsLinks.length} ссылок на новости, парсим карточки...`);
      
      // Собираем уникальные родительские элементы
      const processedUrls = new Set<string>();
      newsLinks.slice(0, 20).each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        if (!href || processedUrls.has(href)) return;
        processedUrls.add(href);
        
        // Находим родительский контейнер карточки
        const $card = $link.closest('div, article, section, li').first();
        if ($card.length === 0) return;
        
        // Извлекаем данные из карточки
        const title = $link.text().trim() || 
                     $card.find('h2, h3, h4, [class*="title"]').first().text().trim() ||
                     'Без заголовка';
        
        if (title === 'Без заголовка' || title.length < 10) return;
        
        // Извлекаем URL
        const fullUrl = href.startsWith('http') ? href : `https://sportrbc.ru${href}`;
        
        // Извлекаем изображение
        let imageUrl = $card.find('img').first().attr('src') || 
                      $card.find('img').first().attr('data-src') ||
                      $card.find('[style*="background-image"]').attr('style')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] ||
                      PLACEHOLDER_IMAGE;
        
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
          imageUrl = `https://sportrbc.ru${imageUrl}`;
        } else if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `https://sportrbc.ru${imageUrl}`;
        } else if (!imageUrl || imageUrl === PLACEHOLDER_IMAGE) {
          imageUrl = PLACEHOLDER_IMAGE;
        }
        
        // Извлекаем категорию/спорт
        const categoryText = $card.find('[class*="category"], [class*="sport"], [class*="tag"], .badge, .label').first().text().trim() ||
                            $card.find('span[class*="category"]').first().text().trim() ||
                            '';
        
        // Извлекаем teaser/описание
        const teaserText = $card.find('p, [class*="teaser"], [class*="description"], [class*="excerpt"]').first().text().trim() ||
                          $card.find('div[class*="text"]').first().text().trim() ||
                          '';
        
        // Извлекаем дату
        const dateText = $card.find('time, [class*="date"], [class*="time"], [datetime]').first().text().trim() ||
                        $card.find('time, [class*="date"]').first().attr('datetime') ||
                        $card.find('[class*="timestamp"]').first().text().trim() ||
                        'Сегодня • 12:00';
        
        const publishedAt = parseDate(dateText);
        
        // Определяем спорт
        const sport = extractSport(categoryText, title, teaserText);
        
        // Генерируем ID
        const id = generateId(title, publishedAt);
        
        // Создаем teaser
        const teaser = extractTeaser(teaserText || title, 150);
        
        const newsItem: ParsedNews = {
          id,
          title,
          sport,
          category: categoryText || null,
          imageUrl,
          teaser,
          sourceName: 'РБК Спорт',
          sourceUrl: fullUrl,
          publishedAt,
        };
        
        news.push(newsItem);
      });
    } else {
      // Парсим найденные блоки новостей
      newsItems.slice(0, 10).each((index, element) => {
        try {
          const $el = $(element);
          
          // Извлекаем заголовок
          const title = $el.find('h2, h3, h4, [class*="title"], a[class*="title"]').first().text().trim() ||
                       $el.find('a').first().text().trim() ||
                       'Без заголовка';
          
          if (title === 'Без заголовка' || title.length < 10) return;
          
          // Извлекаем ссылку
          const link = $el.find('a').first();
          const href = link.attr('href') || '';
          const fullUrl = href.startsWith('http') ? href : `https://sportrbc.ru${href}`;
          
          // Извлекаем изображение
          let imageUrl = $el.find('img').first().attr('src') || 
                        $el.find('img').first().attr('data-src') ||
                        $el.find('[style*="background-image"]').attr('style')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] ||
                        PLACEHOLDER_IMAGE;
          
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = `https://sportrbc.ru${imageUrl}`;
          } else if (imageUrl && imageUrl.startsWith('/')) {
            imageUrl = `https://sportrbc.ru${imageUrl}`;
          } else if (!imageUrl || imageUrl === PLACEHOLDER_IMAGE) {
            imageUrl = PLACEHOLDER_IMAGE;
          }
          
          // Извлекаем категорию/спорт
          const categoryText = $el.find('[class*="category"], [class*="sport"], [class*="tag"], .badge, .label').first().text().trim() ||
                              $el.find('span[class*="category"]').first().text().trim() ||
                              '';
          
          // Извлекаем teaser/описание
          const teaserText = $el.find('p, [class*="teaser"], [class*="description"], [class*="excerpt"]').first().text().trim() ||
                            $el.find('div[class*="text"]').first().text().trim() ||
                            '';
          
          // Извлекаем дату
          const dateText = $el.find('time, [class*="date"], [class*="time"], [datetime]').first().text().trim() ||
                          $el.find('time, [class*="date"]').first().attr('datetime') ||
                          $el.find('[class*="timestamp"]').first().text().trim() ||
                          'Сегодня • 12:00';
          
          const publishedAt = parseDate(dateText);
          
          // Определяем спорт
          const sport = extractSport(categoryText, title, teaserText);
          
          // Генерируем ID
          const id = generateId(title, publishedAt);
          
          // Создаем teaser
          const teaser = extractTeaser(teaserText || title, 150);
          
          const newsItem: ParsedNews = {
            id,
            title,
            sport,
            category: categoryText || null,
            imageUrl,
            teaser,
            sourceName: 'РБК Спорт',
            sourceUrl: fullUrl,
            publishedAt,
          };
          
          news.push(newsItem);
        } catch (error) {
          log(`Ошибка при парсинге новости ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
      });
    }
    
    // Сортируем по дате публикации (самые свежие сверху)
    news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    // Берем только топ-10
    const topNews = news.slice(0, 10);
    
    log(`Успешно распарсено ${topNews.length} новостей`);
    return topNews;
    
  } catch (error) {
    log(`Критическая ошибка при парсинге: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    throw error;
  }
}

// Мок-функция для тестирования
export function getMockNews(): ParsedNews[] {
  const now = new Date();
  const sports = ['Футбол', 'Хоккей', 'Теннис', 'Баскетбол', 'Единоборства'];
  const categories = ['КХЛ', 'НХЛ', 'Премьер-Лига', 'АПЛ', 'ATP', 'WTA', 'NBA', 'UFC'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const sport = sports[i % sports.length];
    const category = categories[i % categories.length];
    const publishedAt = new Date(now.getTime() - i * 3600000); // Каждая новость на час раньше
    
    return {
      id: generateId(`Новость ${i + 1}`, publishedAt),
      title: `Чемпион ${category} трижды вел в счете, но проиграл в овертайме`,
      sport,
      category,
      imageUrl: i === 0 ? 'https://sportrbc.ru/images/news1.jpg' : PLACEHOLDER_IMAGE,
      teaser: `Краткое описание новости ${i + 1}. Это интересная новость о спортивных событиях в ${category}.`,
      sourceName: 'РБК Спорт',
      sourceUrl: `https://sportrbc.ru/news/${i + 1}`,
      publishedAt,
    };
  });
}

