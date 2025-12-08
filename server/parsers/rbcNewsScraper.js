import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Парсер новостей с сайта sportrbc.ru
 * Независимый модуль для парсинга новостей (отдельно от прогнозов)
 */
export class RbcNewsScraper {
  constructor() {
    this.baseUrl = 'https://sportrbc.ru';
    this.maxNews = 10;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];
    this.scrapingDelay = parseInt(process.env.SCRAPING_DELAY) || 3000;
    this.cacheDir = path.join(__dirname, '../cache');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Получает случайный User-Agent
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Генерирует hash ID из title + publishedAt
   */
  generateId(title, publishedAt) {
    const hash = crypto.createHash('md5').update(`${title}-${publishedAt}`).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Нормализует категорию спорта
   */
  normalizeSport(categoryText) {
    if (!categoryText) return 'Другое';
    
    const text = categoryText.toLowerCase();
    
    if (text.includes('футбол') || text.includes('football')) return 'Футбол';
    if (text.includes('хоккей') || text.includes('hockey') || text.includes('кхл') || text.includes('нхл')) return 'Хоккей';
    if (text.includes('баскетбол') || text.includes('basketball') || text.includes('нба')) return 'Баскетбол';
    if (text.includes('теннис') || text.includes('tennis')) return 'Теннис';
    if (text.includes('единоборств') || text.includes('бокс') || text.includes('ufc') || text.includes('mma')) return 'Единоборства';
    
    return 'Другое';
  }

  /**
   * Извлекает категорию/лигу из текста
   */
  extractCategory(categoryText, title) {
    if (!categoryText) {
      // Пытаемся извлечь из заголовка
      const titleLower = title.toLowerCase();
      if (titleLower.includes('кхл')) return 'КХЛ';
      if (titleLower.includes('нхл')) return 'НХЛ';
      if (titleLower.includes('премьер-лига') || titleLower.includes('premier league')) return 'Премьер-Лига';
      if (titleLower.includes('ла лига') || titleLower.includes('la liga')) return 'Ла Лига';
      if (titleLower.includes('серия а') || titleLower.includes('serie a')) return 'Серия А';
      return 'Общее';
    }
    
    // Извлекаем известные лиги
    const text = categoryText.toLowerCase();
    if (text.includes('кхл')) return 'КХЛ';
    if (text.includes('нхл')) return 'НХЛ';
    if (text.includes('премьер-лига')) return 'Премьер-Лига';
    if (text.includes('ла лига')) return 'Ла Лига';
    if (text.includes('серия а')) return 'Серия А';
    
    return categoryText || 'Общее';
  }

  /**
   * Парсит дату публикации (улучшенная версия)
   */
  parsePublishedAt(timeText, $timeElement) {
    try {
      // Пытаемся извлечь из datetime атрибута (ISO формат)
      const datetime = $timeElement?.attr('datetime');
      if (datetime) {
        const parsed = new Date(datetime);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      }

      // Парсим текстовое время
      if (!timeText) {
        console.warn('Время публикации не найдено, используется текущее время');
        return new Date().toISOString();
      }

      const text = timeText.trim();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Пытаемся распарсить ISO формат или полную дату
      const isoDate = new Date(text);
      if (!isNaN(isoDate.getTime()) && text.includes('-') && text.length > 10) {
        return isoDate.toISOString();
      }

      // "2 часа назад", "30 минут назад"
      const hoursMatch = text.match(/(\d+)\s*(час|часа|часов)\s*(назад)?/i);
      if (hoursMatch) {
        const hours = parseInt(hoursMatch[1]);
        const result = new Date(now);
        result.setHours(result.getHours() - hours);
        return result.toISOString();
      }

      const minutesMatch = text.match(/(\d+)\s*(минут|минуты|минуту)\s*(назад)?/i);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        const result = new Date(now);
        result.setMinutes(result.getMinutes() - minutes);
        return result.toISOString();
      }

      // "17:24" или "17:24:30" формат - время публикации сегодня или вчера
      const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        
        // Создаем дату с этим временем на сегодня
        const result = new Date(today);
        result.setHours(hours, minutes, seconds, 0);
        
        // Если время больше текущего, значит это было вчера
        // Но также проверяем: если разница меньше 1 часа, возможно это было сегодня
        if (result > now) {
          // Проверяем, не слишком ли большое время (например, 23:00 при текущем 00:30)
          const diffHours = (result - now) / 36e5;
          if (diffHours > 12) {
            // Если разница больше 12 часов, скорее всего это было вчера
            result.setDate(result.getDate() - 1);
          }
          // Иначе оставляем сегодня (возможно, это утреннее время)
        }
        
        console.log(`Парсинг времени "${text}": ${hours}:${minutes} -> ${result.toISOString()}`);
        return result.toISOString();
      }

      // "DD.MM.YYYY HH:MM" или "DD.MM HH:MM" формат
      const dateTimeMatch = text.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?\s+(\d{1,2}):(\d{2})/);
      if (dateTimeMatch) {
        const day = parseInt(dateTimeMatch[1]);
        const month = parseInt(dateTimeMatch[2]) - 1; // месяцы 0-11
        const year = dateTimeMatch[3] ? parseInt(dateTimeMatch[3]) : now.getFullYear();
        const hours = parseInt(dateTimeMatch[4]);
        const minutes = parseInt(dateTimeMatch[5]);
        
        const result = new Date(year, month, day, hours, minutes, 0, 0);
        if (!isNaN(result.getTime())) {
          return result.toISOString();
        }
      }

      // "Вчера, HH:MM" формат
      const yesterdayMatch = text.match(/вчера[,\s]+(\d{1,2}):(\d{2})/i);
      if (yesterdayMatch) {
        const hours = parseInt(yesterdayMatch[1]);
        const minutes = parseInt(yesterdayMatch[2]);
        const result = new Date(today);
        result.setDate(result.getDate() - 1);
        result.setHours(hours, minutes, 0, 0);
        return result.toISOString();
      }

      // Если ничего не подошло, логируем и возвращаем текущее время
      console.warn(`Не удалось распарсить время: "${timeText}", используется текущее время`);
      return new Date().toISOString();
    } catch (error) {
      console.error('Ошибка парсинга даты:', error, 'timeText:', timeText);
      return new Date().toISOString();
    }
  }

  /**
   * Извлекает teaser (первые 100-150 символов)
   */
  extractTeaser(content, description) {
    if (description && description.length > 0) {
      return description.substring(0, 150).trim();
    }
    if (content && content.length > 0) {
      // Берем первые 2 предложения
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const teaser = sentences.slice(0, 2).join('. ').trim();
      return teaser.substring(0, 150).trim();
    }
    return '';
  }

  /**
   * Получает изображение с детальной страницы новости
   */
  async fetchImageFromDetailPage(url) {
    try {
      // Добавляем небольшую задержку, чтобы не выглядеть как бот
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://sportrbc.ru/',
        },
        timeout: 10000,
        maxRedirects: 5,
      });

      if (response.status !== 200) {
        return null;
      }

      const $ = cheerio.load(response.data);
      
      // Ищем изображение в разных местах на детальной странице
      const imageSelectors = [
        '.article__image img',
        '.article-image img',
        '.news-image img',
        'article img',
        '.content img',
        'main img',
        'img[class*="article"]',
        'img[class*="news"]',
        '.item__image img',
        'picture img'
      ];

      for (const selector of imageSelectors) {
        const $img = $(selector).first();
        if ($img.length > 0) {
          let src = $img.attr('src') || 
                    $img.attr('data-src') || 
                    $img.attr('data-lazy-src') ||
                    $img.attr('data-original');
          
          if (src) {
            src = src.split('?')[0].split(' ')[0].trim();
            
            // Пропускаем placeholder изображения
            if (src.includes('placeholder') || src.includes('default') || 
                src.includes('no-image') || src.includes('spacer')) {
              continue;
            }
            
            // Нормализуем URL
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = this.baseUrl + src;
            } else if (!src.startsWith('http')) {
              continue;
            }
            
            // Проверяем, что это валидный URL изображения
            if (src.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i) || 
                src.includes('/image') || 
                src.includes('/photo') ||
                src.includes('/img') ||
                src.includes('/media') ||
                src.includes('/pics') ||
                src.includes('rbc.ru')) {
              return src;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Ошибка при получении изображения с детальной страницы ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Получает полный контент новости (опционально)
   */
  async fetchFullContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Ищем основной контент статьи
      const contentSelectors = [
        'article .article-content',
        'article .content',
        '.article-body',
        '.post-content',
        'article p',
        '.news-content'
      ];

      let fullContent = '';
      for (const selector of contentSelectors) {
        const $content = $(selector);
        if ($content.length > 0) {
          fullContent = $content.text().trim();
          break;
        }
      }

      return fullContent || '';
    } catch (error) {
      console.error(`Ошибка при получении полного контента для ${url}:`, error.message);
      return '';
    }
  }

  /**
   * Проверяет кэш HTML
   */
  getCachedHtml() {
    const cacheFile = path.join(this.cacheDir, 'sportrbc-cache.html');
    const cacheTime = 10 * 60 * 1000; // 10 минут

    try {
      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const age = Date.now() - stats.mtimeMs;
        if (age < cacheTime) {
          return fs.readFileSync(cacheFile, 'utf-8');
        }
      }
    } catch (error) {
      console.error('Ошибка чтения кэша:', error);
    }
    return null;
  }

  /**
   * Сохраняет HTML в кэш
   */
  saveCachedHtml(html) {
    const cacheFile = path.join(this.cacheDir, 'sportrbc-cache.html');
    try {
      fs.writeFileSync(cacheFile, html, 'utf-8');
    } catch (error) {
      console.error('Ошибка сохранения кэша:', error);
    }
  }

  /**
   * Основной метод парсинга новостей
   */
  async scrapeRbcNews() {
    try {
      // Задержка перед парсингом
      await new Promise(resolve => setTimeout(resolve, this.scrapingDelay));

      // Проверяем кэш
      let html = this.getCachedHtml();
      
      if (!html) {
        console.log('Загрузка страницы sportrbc.ru...');
        const response = await axios.get(this.baseUrl, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.google.com/'
          },
          timeout: 15000
        });

        html = response.data;
        this.saveCachedHtml(html);
      } else {
        console.log('Использование кэшированного HTML');
      }

      const $ = cheerio.load(html);
      const news = [];
      const seenUrls = new Set(); // Для дедупликации по URL

      // Улучшенный подход: ищем ссылки на новости напрямую
      const newsLinks = [];
      
      // Ищем все ссылки на новости
      $('a[href*="/sport/"], a[href*="/news/"], a[href*="/article/"]').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        
        if (href && (href.includes('/sport/') || href.includes('/news/') || href.includes('/article/'))) {
          // Пропускаем служебные ссылки
          if (href.includes('#') || href.includes('javascript:') || href.includes('mailto:')) {
            return;
          }
          
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          
          // Дедупликация по URL
          if (!seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            
            // Находим родительский контейнер новости
            const $parent = $link.closest('div, article, li, section').first();
            if ($parent.length > 0) {
              newsLinks.push({
                $container: $parent,
                url: fullUrl,
                $link: $link
              });
            }
          }
        }
      });

      console.log(`Найдено уникальных ссылок на новости: ${newsLinks.length}`);

      // Обрабатываем найденные новости (асинхронно для возможности парсинга детальных страниц)
      for (let i = 0; i < Math.min(newsLinks.length, this.maxNews * 3); i++) {
        if (news.length >= this.maxNews) break;

        const { $container, url, $link } = newsLinks[i];
        const $el = $container;
        
        // Для первой новости выводим больше информации для отладки
        if (i === 0) {
          console.log(`\n=== Отладка первой новости ===`);
          console.log(`URL: ${url}`);
          const htmlSample = $el.html()?.substring(0, 1000) || '';
          const textSample = $el.text()?.substring(0, 500) || '';
          console.log(`HTML контейнера (первые 1000 символов): ${htmlSample}`);
          console.log(`Текст контейнера (первые 500 символов): ${textSample}`);
        }

        // Извлекаем данные
        const title = this.extractTitle($el, $link, $);
        
        // Извлекаем изображение из контейнера новости
        let imageUrl = this.extractImage($el, $);
        
        // Если не нашли в контейнере, ищем в родительском элементе
        // но только в ближайшем родителе, который содержит ссылку на эту новость
        if (!imageUrl) {
          // Находим ближайший родитель, который содержит ссылку на эту новость
          let $parent = $el.parent();
          let $parentWithLink = null;
          
          // Ищем родителя, который содержит ссылку на эту новость (максимум 2 уровня вверх)
          for (let j = 0; j < 2 && $parent.length > 0; j++) {
            // Проверяем, содержит ли родитель ссылку на эту новость
            const $linkInParent = $parent.find(`a[href="${url}"]`);
            if ($linkInParent.length > 0) {
              $parentWithLink = $parent;
              break;
            }
            $parent = $parent.parent();
          }
          
          // Если нашли родителя с ссылкой, ищем изображение только в нем
          if ($parentWithLink && $parentWithLink.length > 0) {
            imageUrl = this.extractImage($parentWithLink, $);
            
            // Проверяем уникальность - не используется ли это изображение другими новостями
            if (imageUrl) {
              const isDuplicate = news.some(n => n.imageUrl === imageUrl);
              if (isDuplicate) {
                imageUrl = null;
              }
            }
          }
        }
        
        // Если все еще не нашли, ищем в основном блоке новостей по data-id
        // Для новостей из ленты (news-feed) изображения находятся в основном блоке выше
        if (!imageUrl) {
          // Извлекаем ID новости из URL (например, из /news/693187f29a794740d6860861 извлекаем 693187f29a794740d6860861)
          const newsIdMatch = url.match(/\/news\/([^\/\?]+)/);
          if (newsIdMatch && newsIdMatch[1]) {
            const newsId = newsIdMatch[1];
            
            // Ищем элемент с data-id, соответствующий этой новости
            const $newsItem = $(`.js-rm-central-column-item[data-id="${newsId}"]`);
            if ($newsItem.length > 0) {
              imageUrl = this.extractImage($newsItem, $);
              
              // Проверяем уникальность
              if (imageUrl) {
                const isDuplicate = news.some(n => n.imageUrl === imageUrl);
                if (isDuplicate) {
                  imageUrl = null;
                }
              }
            }
          }
        }
        
        // Если все еще не нашли изображение, пытаемся получить его с детальной страницы новости
        // Это последний резервный вариант для новостей из ленты, у которых нет изображений на главной
        if (!imageUrl && url) {
          try {
            console.log(`Попытка получить изображение с детальной страницы: ${url}`);
            const detailImage = await this.fetchImageFromDetailPage(url);
            if (detailImage) {
              // Проверяем уникальность
              const isDuplicate = news.some(n => n.imageUrl === detailImage);
              if (!isDuplicate) {
                imageUrl = detailImage;
                console.log(`✅ Изображение получено с детальной страницы: ${imageUrl}`);
              } else {
                console.log(`⚠️ Изображение с детальной страницы уже используется другой новостью`);
              }
            }
          } catch (error) {
            console.warn(`Не удалось получить изображение с детальной страницы: ${error.message}`);
          }
        }
        
        const category = this.extractCategoryFromElement($el, $);
        const sport = this.normalizeSport(category);
        
        // Извлекаем время - сначала из специальных элементов, затем из текста
        const $timeElement = $el.find('time, [class*="time"], [class*="date"], [datetime]').first();
        let timeText = this.extractTime($el, $);
        
        // Если не нашли время в контейнере, ищем в родительских элементах
        if (!timeText) {
          let $parent = $el.parent();
          for (let j = 0; j < 3 && $parent.length > 0; j++) {
            timeText = this.extractTime($parent, $);
            if (timeText) break;
            $parent = $parent.parent();
          }
        }
        
        // Если все еще не нашли, пытаемся получить время из детальной страницы (для всех новостей)
        if (!timeText && url) {
          try {
            console.log(`Попытка получить время из детальной страницы: ${url}`);
            const detailTime = await this.fetchTimeFromDetailPage(url);
            if (detailTime) {
              timeText = detailTime;
              console.log(`✅ Время получено из детальной страницы: ${timeText}`);
            }
          } catch (error) {
            console.warn(`Не удалось получить время из детальной страницы: ${error.message}`);
          }
        }
        
        const publishedAt = this.parsePublishedAt(timeText, $timeElement);
        
        // Логируем для отладки
        if (timeText) {
          const parsedDate = new Date(publishedAt);
          const now = new Date();
          const diffHours = Math.abs(now - parsedDate) / 36e5;
          console.log(`✅ Время найдено: "${timeText}" -> ${publishedAt} (${parsedDate.toLocaleString('ru-RU')}, разница: ${diffHours.toFixed(1)} часов)`);
          
          // Если разница больше 24 часов, возможно время парсится неправильно
          if (diffHours > 24) {
            console.warn(`⚠️ Подозрительно большая разница во времени: ${diffHours.toFixed(1)} часов`);
          }
        } else {
          console.warn(`❌ Время не найдено для новости: ${title?.substring(0, 50)}`);
          // Выводим текст для отладки только для первых 2 новостей
          if (i < 2) {
            const textSample = $el.text()?.substring(0, 300) || '';
            console.log(`Текст контейнера (первые 300 символов): ${textSample}`);
            
            // Пытаемся найти время в HTML атрибутах
            const $allWithTime = $el.find('*');
            let foundInAttrs = false;
            $allWithTime.each((idx, elem) => {
              if (foundInAttrs) return false;
              const $elem = $(elem);
              const attrs = $elem.attr();
              if (attrs) {
                for (const [key, value] of Object.entries(attrs)) {
                  if (value && /\d{1,2}:\d{2}/.test(value)) {
                    console.log(`Найдено время в атрибуте ${key}: ${value}`);
                    foundInAttrs = true;
                    return false;
                  }
                }
              }
            });
          }
        }
        
        const description = this.extractDescription($el, $);

        if (title && url && title.length > 10) {
          // Дополнительная проверка на дубликаты по заголовку
          const isDuplicate = news.some(n => {
            const titleSimilarity = this.calculateSimilarity(n.title, title);
            return titleSimilarity > 0.8; // Если заголовки похожи более чем на 80%
          });

          if (!isDuplicate) {
            const id = this.generateId(title, publishedAt);

            // Извлекаем teaser
            const teaser = this.extractTeaser('', description);
            
            // Нормализуем URL изображения
            let normalizedImageUrl = imageUrl;
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
              normalizedImageUrl = `${this.baseUrl}/${imageUrl}`;
            } else if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
              normalizedImageUrl = `${this.baseUrl}${imageUrl}`;
            } else if (imageUrl && imageUrl.startsWith('//')) {
              normalizedImageUrl = `https:${imageUrl}`;
            }

            news.push({
              id,
              title: this.cleanTitle(title),
              sport,
              category: this.extractCategory(category, title),
              imageUrl: normalizedImageUrl || '/images/news-placeholder.jpg',
              teaser: teaser || title.substring(0, 100),
              fullContent: '', // Будет заполнено опционально
              sourceName: 'РБК Спорт',
              sourceUrl: url,
              publishedAt,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }

      console.log(`Спарсено новостей: ${news.length}`);
      return news.slice(0, this.maxNews);
    } catch (error) {
      console.error('Ошибка при парсинге новостей sportrbc.ru:', error);
      throw error;
    }
  }

  /**
   * Извлекает заголовок (улучшенная версия с исключением категорий и времени)
   */
  extractTitle($el, $link = null, $ = null) {
    // Если $ не передан, используем cheerio из $el
    if (!$ && $el && typeof $el.find === 'function') {
      // Пытаемся получить $ из контекста
      $ = $el.constructor;
    }
    
    // Сначала пытаемся найти заголовок в ссылке
    if ($link && $link.length > 0) {
      const linkText = $link.text().trim();
      if (linkText.length > 10) {
        // Убираем категории и время из текста ссылки
        const cleaned = this.cleanTitle(linkText);
        if (cleaned.length > 10) {
          return cleaned;
        }
      }
    }

    // Ищем заголовки в контейнере
    const selectors = [
      'h1', 'h2', 'h3', 'h4',
      '.news-item__title',
      '.article-title',
      '.title',
      '[class*="title"]',
      '[class*="headline"]',
      '[class*="name"]'
    ];

    for (const selector of selectors) {
      const $title = $el.find(selector).first();
      if ($title.length > 0) {
        // Клонируем элемент, чтобы не изменять оригинал
        const $titleClone = $title.clone();
        
        // Удаляем дочерние элементы с категориями и временем
        $titleClone.find('.category, .tag, .time, .date, [class*="category"], [class*="tag"], [class*="time"], [class*="date"], time, .badge, .meta, [class*="meta"]').remove();
        let text = $titleClone.text().trim();
        
        if (text.length > 10) {
          const cleaned = this.cleanTitle(text);
          if (cleaned.length > 10) {
            return cleaned;
          }
        }
      }
    }

    // Если не нашли, используем текст ссылки
    if ($link && $link.length > 0) {
      const text = $link.text().trim();
      if (text.length > 10) {
        const cleaned = this.cleanTitle(text);
        if (cleaned.length > 10) {
          return cleaned;
        }
      }
    }

    return null;
  }

  /**
   * Очищает заголовок от категорий, времени и лишних символов
   */
  cleanTitle(title) {
    if (!title) return '';
    
    let cleaned = title.trim();
    
    // Удаляем паттерны времени (например, "21:47", "1 час назад", "вчера")
    cleaned = cleaned.replace(/\d{1,2}:\d{2}/g, '');
    cleaned = cleaned.replace(/\d+\s*(час|часа|часов|минут|минуты|минуту)\s*(назад)?/gi, '');
    cleaned = cleaned.replace(/\d+\s*(день|дня|дней)\s*(назад)?/gi, '');
    cleaned = cleaned.replace(/\s*(вчера|сегодня|только что)\s*/gi, '');
    
    // Удаляем категории в начале или конце (например, "Другое, " или ", Другое, 21:47")
    const categories = ['Другое', 'Футбол', 'Хоккей', 'Баскетбол', 'Теннис', 'Единоборства', 'Киберспорт', 'Автоспорт'];
    categories.forEach(cat => {
      // В начале: "Категория, " или "Категория "
      cleaned = cleaned.replace(new RegExp(`^${cat}[,\\s]+`, 'i'), '');
      // В конце: ", Категория" или " Категория" или ", Категория, 21:47"
      cleaned = cleaned.replace(new RegExp(`[,\\s]+${cat}([,\\s]|$)`, 'i'), '');
    });
    
    // Удаляем паттерны типа "Категория, Время" в начале
    cleaned = cleaned.replace(/^[^,]+,\s*\d{1,2}:\d{2}[,\s]*/i, '');
    
    // Удаляем множественные пробелы и запятые
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/,\s*,/g, ','); // Двойные запятые
    cleaned = cleaned.replace(/,\s*$/g, ''); // Запятая в конце
    
    // Удаляем ведущие/замыкающие запятые, точки и пробелы
    cleaned = cleaned.replace(/^[,\s.]+|[,\s.]+$/g, '');
    
    return cleaned.trim();
  }

  /**
   * Вычисляет схожесть двух строк (0-1)
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;
    
    // Простой алгоритм схожести
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    // Проверяем, содержит ли одна строка другую
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }
    
    // Считаем общие слова
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    
    if (commonWords.length === 0) return 0.0;
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Извлекает URL (улучшенная версия - уже не используется, так как URL передаётся)
   */
  extractUrl($el, $) {
    // Ищем самую большую ссылку (вероятно, это ссылка на новость)
    const $links = $el.find('a[href*="/sport/"], a[href*="/news/"], a[href*="/article/"]');
    
    let bestLink = null;
    let maxTextLength = 0;
    
    $links.each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const textLength = $link.text().trim().length;
      
      if (href && textLength > maxTextLength && textLength > 10) {
        maxTextLength = textLength;
        bestLink = href;
      }
    });
    
    if (bestLink) {
      return bestLink;
    }
    
    // Fallback на первую ссылку
    const $link = $el.find('a').first();
    if ($link.length > 0) {
      const href = $link.attr('href');
      if (href) {
        return href;
      }
    }
    
    return null;
  }

  /**
   * Извлекает изображение (улучшенная версия)
   */
  extractImage($el, $) {
    // Ищем все изображения в контейнере
    const $images = $el.find('img');
    
    // Собираем все возможные изображения с приоритетами
    const candidates = [];
    
    for (let i = 0; i < $images.length; i++) {
      const $img = $($images[i]);
      
      // Пропускаем изображения с подозрительными классами (иконки, аватары, логотипы)
      const imgClass = ($img.attr('class') || '').toLowerCase();
      if (imgClass.includes('icon') || imgClass.includes('avatar') || imgClass.includes('logo') || 
          imgClass.includes('emoji') || imgClass.includes('badge')) {
        continue;
      }
      
      // Пробуем разные атрибуты для src (расширенный список)
      let src = $img.attr('src') || 
                $img.attr('data-src') || 
                $img.attr('data-lazy-src') ||
                $img.attr('data-original') ||
                $img.attr('data-url') ||
                $img.attr('data-image') ||
                $img.attr('data-image-src') ||
                $img.attr('data-lazy') ||
                $img.attr('srcset')?.split(' ')[0];
      
      if (!src) continue;
      
      // Убираем параметры размеров если есть
      src = src.split('?')[0].split(' ')[0].trim();
      
      // Пропускаем placeholder изображения
      if (src.includes('placeholder') || src.includes('default') || 
          src.includes('no-image') || src.includes('spacer') || 
          src.includes('blank') || src.includes('1x1')) {
        continue;
      }
      
      // Нормализуем URL
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        src = this.baseUrl + src;
      } else if (!src.startsWith('http')) {
        // Пропускаем относительные пути без / (например, "image.jpg")
        continue;
      }
      
      // Проверяем размер изображения (если указан)
      const width = parseInt($img.attr('width')) || 0;
      const height = parseInt($img.attr('height')) || 0;
      
      // Приоритет: большие изображения важнее
      let priority = 1;
      
      // Если размер указан и маленький - понижаем приоритет, но не исключаем полностью
      if (width > 0 && width < 100) priority = 0.5;
      if (height > 0 && height < 100) priority = 0.5;
      
      // Проверяем, что это похоже на URL изображения
      // Более мягкая проверка - принимаем любые URL с расширениями изображений
      // или URL с типичными путями для изображений
      const isImageUrl = src.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i) || 
                         src.includes('/image') || 
                         src.includes('/photo') ||
                         src.includes('/img') ||
                         src.includes('/media') ||
                         src.includes('/pics') ||
                         src.includes('/picture') ||
                         src.match(/\/\d+\/\d+\//) || // Паттерн типа /123/456/
                         src.match(/\/v\d+\//) || // Паттерн типа /v6/
                         src.includes('rbc.ru'); // Доверяем домену rbc.ru
      
      if (isImageUrl) {
        candidates.push({ src, priority, width, height });
      }
    }
    
    // Сортируем кандидатов по приоритету и размеру
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        // Сначала по приоритету
        if (a.priority !== b.priority) return b.priority - a.priority;
        // Затем по размеру (больше = лучше)
        const aSize = a.width * a.height;
        const bSize = b.width * b.height;
        return bSize - aSize;
      });
      
      return candidates[0].src;
    }
    
    // Если не нашли img, ищем background-image
    const $withBg = $el.find('[style*="background-image"], [style*="background:"]').first();
    if ($withBg.length > 0) {
      const style = $withBg.attr('style') || '';
      const bgMatch = style.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (bgMatch && bgMatch[1]) {
        let bgSrc = bgMatch[1].trim();
        if (bgSrc.startsWith('//')) {
          bgSrc = 'https:' + bgSrc;
        } else if (bgSrc.startsWith('/')) {
          bgSrc = this.baseUrl + bgSrc;
        } else if (bgSrc.startsWith('http')) {
          return bgSrc;
        }
      }
    }
    
    // Также проверяем data-атрибуты контейнера для background-image
    const bgDataSrc = $el.attr('data-bg') || $el.attr('data-background') || $el.attr('data-image');
    if (bgDataSrc) {
      let bgSrc = bgDataSrc.trim();
      if (bgSrc.startsWith('//')) {
        bgSrc = 'https:' + bgSrc;
      } else if (bgSrc.startsWith('/')) {
        bgSrc = this.baseUrl + bgSrc;
      } else if (bgSrc.startsWith('http')) {
        return bgSrc;
      }
    }
    
    return null;
  }

  /**
   * Извлекает категорию из элемента
   */
  extractCategoryFromElement($el, $) {
    const selectors = [
      '.category',
      '.sport-tag',
      '[class*="category"]',
      '[class*="tag"]',
      '[class*="sport"]',
      'span.badge',
      '.label'
    ];

    for (const selector of selectors) {
      const $cat = $el.find(selector).first();
      if ($cat.length > 0) {
        const text = $cat.text().trim();
        if (text.length > 0 && text.length < 50) {
          return text;
        }
      }
    }

    return null;
  }

  /**
   * Получает время публикации из детальной страницы новости
   */
  async fetchTimeFromDetailPage(url) {
    try {
      // Добавляем небольшую задержку, чтобы не выглядеть как бот
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://sportrbc.ru/',
          'DNT': '1'
        },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Принимаем все статусы кроме 5xx
        }
      });
      
      // Если получили 406, пробуем с более простыми заголовками
      if (response.status === 406) {
        console.warn(`Получен статус 406 для ${url}, пробуем с упрощенными заголовками...`);
        const retryResponse = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9'
          },
          timeout: 10000
        });
        
        if (retryResponse.status !== 200) {
          throw new Error(`Request failed with status code ${retryResponse.status}`);
        }
        
        const $ = cheerio.load(retryResponse.data);
        return this.extractTimeFromPage($);
      }
      
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      return this.extractTimeFromPage($);
    } catch (error) {
      console.error(`Ошибка при получении времени из детальной страницы ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Извлекает время из загруженной страницы (вынесено в отдельный метод для переиспользования)
   */
  extractTimeFromPage($) {
      // Ищем время в разных местах на детальной странице
      const timeSelectors = [
        'time[datetime]',
        '[datetime]',
        '[class*="time"]',
        '[class*="date"]',
        '[itemprop="datePublished"]',
        '[itemprop="dateCreated"]',
        'meta[property="article:published_time"]',
        'meta[name="pubdate"]',
        'meta[name="publishdate"]',
        '[class*="published"]',
        '[class*="publish"]'
      ];

      for (const selector of timeSelectors) {
        const $time = $(selector).first();
        if ($time.length > 0) {
          const datetime = $time.attr('datetime') || $time.attr('content') || $time.attr('data-time');
          if (datetime) {
            // Проверяем, что это валидная дата
            const parsed = new Date(datetime);
            if (!isNaN(parsed.getTime())) {
              console.log(`Время найдено в ${selector}: ${datetime}`);
              return datetime;
            }
          }
          const text = $time.text().trim();
          if (text && /\d{1,2}:\d{2}/.test(text)) {
            const timeMatch = text.match(/(\d{1,2}:\d{2})/);
            if (timeMatch) {
              console.log(`Время найдено в тексте ${selector}: ${timeMatch[1]}`);
              return timeMatch[1];
            }
          }
        }
      }

      // Ищем в JSON-LD структурированных данных
      const jsonLdScripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < jsonLdScripts.length; i++) {
        try {
          const json = JSON.parse($(jsonLdScripts[i]).html());
          if (json.datePublished || json.dateCreated) {
            const dateValue = json.datePublished || json.dateCreated;
            console.log(`Время найдено в JSON-LD: ${dateValue}`);
            return dateValue;
          }
          // Также проверяем вложенные объекты
          if (json['@graph'] && Array.isArray(json['@graph'])) {
            for (const item of json['@graph']) {
              if (item.datePublished || item.dateCreated) {
                const dateValue = item.datePublished || item.dateCreated;
                console.log(`Время найдено в JSON-LD @graph: ${dateValue}`);
                return dateValue;
              }
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга JSON
        }
      }

      // Ищем в тексте страницы (более широкий поиск)
      const pageText = $('body').text();
      
      // Паттерн: "Категория, HH:MM"
      const categories = ['Другое', 'Другие', 'Футбол', 'Хоккей', 'Баскетбол', 'Теннис', 'Единоборства', 'Киберспорт', 'Автоспорт'];
      for (const category of categories) {
        const pattern = new RegExp(`${category}[,\\s]+(\\d{1,2}:\\d{2})`, 'i');
        const match = pageText.match(pattern);
        if (match && match[1]) {
          console.log(`Время найдено в тексте страницы (${category}): ${match[1]}`);
          return match[1];
        }
      }

      // Ищем любое время в формате ISO в мета-информации
      const metaTags = $('meta');
      for (let i = 0; i < metaTags.length; i++) {
        const $meta = $(metaTags[i]);
        const content = $meta.attr('content');
        if (content && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(content)) {
          console.log(`Время найдено в meta: ${content}`);
          return content;
        }
      }

      console.warn(`Время не найдено на детальной странице`);
      return null;
  }

  /**
   * Извлекает время публикации (улучшенная версия - ищет время после категории)
   */
  extractTime($el, $) {
    // Сначала ищем в специальных элементах времени
    const selectors = [
      'time',
      '[class*="time"]',
      '[class*="date"]',
      '[datetime]',
      '[class*="published"]',
      '[class*="publish"]',
      '[class*="meta"]'
    ];

    for (const selector of selectors) {
      const $time = $el.find(selector);
      $time.each((index, element) => {
        const $elem = $(element);
        const datetime = $elem.attr('datetime');
        if (datetime) {
          return datetime;
        }
        const text = $elem.text().trim();
        // Проверяем, что текст содержит время в формате HH:MM
        if (text && /\d{1,2}:\d{2}/.test(text)) {
          const timeMatch = text.match(/(\d{1,2}:\d{2})/);
          if (timeMatch) {
            return timeMatch[1];
          }
        }
      });
    }

    // Ищем время в тексте после категории (паттерн: "Категория, HH:MM" или "Категория, Время")
    // Получаем весь текст контейнера, включая дочерние элементы
    const allText = $el.text();
    
    // Расширенный список категорий
    const categories = ['Другое', 'Другие', 'Футбол', 'Хоккей', 'Баскетбол', 'Теннис', 'Единоборства', 'Киберспорт', 'Автоспорт', 'Гандбол', 'Волейбол', 'Бокс', 'MMA', 'UFC'];
    
    // Паттерн: "Категория, HH:MM" или "Категория HH:MM" (более гибкий)
    for (const category of categories) {
      const pattern = new RegExp(`${category}[,\\s]+(\\d{1,2}:\\d{2})`, 'i');
      const match = allText.match(pattern);
      if (match && match[1]) {
        console.log(`✅ Найдено время после категории "${category}": ${match[1]}`);
        return match[1];
      }
    }
    
    // Более общий паттерн: любое слово (возможно категория), запятая, пробел, время
    const generalPattern = allText.match(/[А-Яа-яЁёA-Za-z]+[,\s]+(\d{1,2}:\d{2})/);
    if (generalPattern && generalPattern[1]) {
      // Проверяем, что это не часть URL или другого кода
      const context = generalPattern[0];
      if (!context.includes('http') && !context.includes('://') && !context.includes('www')) {
        console.log(`✅ Найдено время в общем паттерне: ${generalPattern[1]} (контекст: ${context})`);
        return generalPattern[1];
      }
    }
    
    // Ищем все элементы с текстом, содержащим время
    const $allElements = $el.find('*');
    $allElements.each((index, element) => {
      const $elem = $(element);
      const text = $elem.text().trim();
      
      // Пропускаем заголовки и большие тексты
      if (text.length > 100) return;
      
      // Ищем паттерн "Категория, HH:MM"
      const match = text.match(/(?:Другое|Футбол|Хоккей|Баскетбол|Теннис|Единоборства|Киберспорт|Автоспорт|Другие)[,\s]+(\d{1,2}:\d{2})/i);
      if (match && match[1]) {
        console.log(`Найдено время в элементе: ${match[1]}`);
        return match[1];
      }
    });
    
    // Паттерн: просто "HH:MM" в тексте (но не в заголовке)
    const timePattern = allText.match(/\b(\d{1,2}:\d{2})\b/g);
    if (timePattern && timePattern.length > 0) {
      // Берем последнее время (обычно время публикации идет после заголовка)
      const timeText = timePattern[timePattern.length - 1];
      const timeIndex = allText.lastIndexOf(timeText);
      const titleText = this.extractTitle($el, null, $);
      if (titleText) {
        const titleIndex = allText.indexOf(titleText);
        // Если время идет после заголовка, это валидное время
        if (timeIndex > titleIndex + titleText.length) {
          console.log(`Найдено время после заголовка: ${timeText}`);
          return timeText;
        }
      } else {
        console.log(`Найдено время в тексте: ${timeText}`);
        return timeText;
      }
    }

    // Ищем в метаданных или атрибутах
    const metaTime = $el.find('[itemprop="datePublished"], [itemprop="dateCreated"], meta[property="article:published_time"]').first();
    if (metaTime.length > 0) {
      const content = metaTime.attr('content') || metaTime.attr('datetime');
      if (content) {
        console.log(`Найдено время в метаданных: ${content}`);
        return content;
      }
    }

    // Ищем в родительских элементах
    let $parent = $el.parent();
    for (let i = 0; i < 2 && $parent.length > 0; i++) {
      const parentText = $parent.text();
      const parentTimeMatch = parentText.match(/(?:Другое|Футбол|Хоккей|Баскетбол|Теннис|Единоборства|Киберспорт|Автоспорт|Другие)[,\s]+(\d{1,2}:\d{2})/i);
      if (parentTimeMatch && parentTimeMatch[1]) {
        console.log(`Найдено время в родительском элементе: ${parentTimeMatch[1]}`);
        return parentTimeMatch[1];
      }
      $parent = $parent.parent();
    }

    console.warn('Время не найдено в элементе');
    return null;
  }

  /**
   * Извлекает описание
   */
  extractDescription($el, $) {
    const selectors = [
      '.description',
      '.excerpt',
      '.teaser',
      '.summary',
      '[class*="description"]',
      '[class*="excerpt"]',
      'p'
    ];

    for (const selector of selectors) {
      const $desc = $el.find(selector).first();
      if ($desc.length > 0) {
        const text = $desc.text().trim();
        if (text.length > 20) {
          return text;
        }
      }
    }

    return null;
  }

  /**
   * Мок-данные для тестирования
   */
  getMockNews() {
    return [
      {
        id: 'mock1',
        title: 'Чемпион КХЛ трижды вёл в счёте, но проиграл СКА в овертайме',
        sport: 'Хоккей',
        category: 'КХЛ',
        imageUrl: '/images/news-placeholder.jpg',
        teaser: 'В матче чемпионата КХЛ команда трижды выходила вперёд, но в итоге уступила СКА в овертайме со счётом 4:3.',
        fullContent: '',
        sourceName: 'РБК Спорт',
        sourceUrl: 'https://sportrbc.ru/news/mock1',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock2',
        title: 'Манчестер Сити разгромил Ливерпуль в матче Премьер-Лиги',
        sport: 'Футбол',
        category: 'Премьер-Лига',
        imageUrl: '/images/news-placeholder.jpg',
        teaser: 'Манчестер Сити одержал убедительную победу над Ливерпулем со счётом 4:1 в матче английской Премьер-Лиги.',
        fullContent: '',
        sourceName: 'РБК Спорт',
        sourceUrl: 'https://sportrbc.ru/news/mock2',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      // Можно добавить ещё 8 новостей
    ];
  }
}

