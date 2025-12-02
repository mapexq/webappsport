import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Парсер новостей с сайта bookmaker-ratings.ru
 * Отдельный парсер для новостей (разделение промптов парсинга прогнозов и новостей)
 */
export class NewsParser {
  constructor() {
    this.baseUrl = 'https://bookmaker-ratings.ru/news/';
    this.maxNews = 20;
  }

  /**
   * Парсит страницу новостей и извлекает последние новости
   */
  async parseNews() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      const $ = cheerio.load(response.data);
      const news = [];

      // Ищем карточки новостей
      $('article, div[class*="news"], div[class*="article"]').each((index, element) => {
        if (news.length >= this.maxNews) return false;
        
        const $el = $(element);
        const title = this.extractTitle($el, $);
        const excerpt = this.extractExcerpt($el, $);
        const image = this.extractImage($el, $);
        const category = this.extractCategory($el, $);
        const author = this.extractAuthor($el, $);
        const timestamp = this.extractTimestamp($el, $);
        const url = this.extractUrl($el, $);

        if (title && url) {
          news.push({
            title,
            excerpt,
            image,
            category,
            author,
            timestamp,
            url
          });
        }
      });

      return news.slice(0, this.maxNews);
    } catch (error) {
      console.error('Ошибка при парсинге новостей:', error);
      throw error;
    }
  }

  extractTitle($el, $) {
    const $title = $el.find('h1, h2, h3, h4, a[class*="title"]').first();
    if ($title.length > 0) {
      return $title.text().trim();
    }
    return null;
  }

  extractExcerpt($el, $) {
    const $excerpt = $el.find('p, div[class*="excerpt"], div[class*="description"]').first();
    if ($excerpt.length > 0) {
      return $excerpt.text().trim().substring(0, 200);
    }
    return null;
  }

  extractImage($el, $) {
    const $img = $el.find('img').first();
    if ($img.length > 0) {
      const src = $img.attr('src') || $img.attr('data-src');
      if (src) {
        return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
      }
    }
    return null;
  }

  extractCategory($el, $) {
    const $category = $el.find('[class*="category"], [class*="tag"], span, a').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('футбол') || text.includes('хоккей') || text.includes('баскетбол') || 
             text.includes('новости') || text.includes('спорт');
    }).first();
    
    if ($category.length > 0) {
      return $category.text().trim();
    }
    return 'Новости';
  }

  extractAuthor($el, $) {
    const $author = $el.find('a[href*="/author/"], [class*="author"]').first();
    if ($author.length > 0) {
      return $author.text().trim();
    }
    return 'Редакция';
  }

  extractTimestamp($el, $) {
    const $time = $el.find('time, [class*="time"], [class*="date"]').first();
    if ($time.length > 0) {
      return $time.text().trim();
    }
    return 'Недавно';
  }

  extractUrl($el, $) {
    const $link = $el.find('a').first();
    if ($link.length > 0) {
      const href = $link.attr('href');
      if (href) {
        return href.startsWith('http') ? href : `https://bookmaker-ratings.ru${href}`;
      }
    }
    return null;
  }
}

