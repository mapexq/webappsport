import axios from 'axios';
import * as cheerio from 'cheerio';
import { findTimestampInCard, parseTimestampToDate } from './timestampUtils.js';

/**
 * Парсер прогнозов с сайта bookmaker-ratings.ru/forecast_homepage/
 * Извлекает последние 10 прогнозов с сохранением всей структуры
 */
export class PredictionsParser {
  constructor() {
    this.baseUrl = 'https://bookmaker-ratings.ru/forecast_homepage/';
    this.maxPredictions = 10;
  }

  /**
   * Парсит страницу и извлекает прогнозы
   */
  async parsePredictions() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      const $ = cheerio.load(response.data);
      const predictions = [];

      // Метод 1: Ищем через time элементы (время публикации)
      // Пропускаем экспрессы - ищем только ординары
      $('time').each((index, element) => {
        if (predictions.length >= this.maxPredictions) return false;
        
        const $time = $(element);
        // Находим родительский контейнер карточки
        let $card = $time.closest('div');
        
        // Поднимаемся выше, если нужно
        for (let i = 0; i < 5; i++) {
          const cardText = $card.text();
          if (cardText.includes('прогноз') && cardText.includes('ставка')) {
            break;
          }
          $card = $card.parent();
        }

        // Пропускаем экспрессы
        const cardText = $card.text();
        if (cardText.includes('Экспресс') || cardText.includes('экспресс')) {
          return; // Пропускаем этот элемент
        }

        const expertName = this.findExpertName($card, $);
        const timestamp = this.findTimestamp($card, $);
        const title = this.findTitle($card, $);
        const comment = this.findComment($card, $);
        const matchInfo = this.findMatchInfo($card, $);
        const prediction = this.findPrediction($card, $);
        const odds = this.findOdds($card, $);
        const avatar = this.findAvatar($card, $);

        // Проверяем, что это валидный прогноз (не экспресс, есть название матча)
        if (expertName && prediction && odds && matchInfo?.teams && matchInfo.teams.length > 5) {
          // Проверяем, что это не дубликат
          const isDuplicate = predictions.some(p => 
            p.expertName === expertName && 
            p.prediction === prediction && 
            Math.abs(p.odds - odds) < 0.01 &&
            p.matchInfo?.teams === matchInfo.teams
          );
          
          if (!isDuplicate) {
            predictions.push({
              expertName,
              timestamp,
              title,
              comment,
              matchInfo,
              prediction,
              odds,
              avatar
            });
          }
        }
      });

      // Метод 2: Если не нашли достаточно, ищем через ссылки на матчи
      if (predictions.length < this.maxPredictions) {
        $('a[href*="/tips/event-"]').each((index, element) => {
          if (predictions.length >= this.maxPredictions) return false;
          
          const $link = $(element);
          const $card = $link.closest('div').parent().parent();
          
          // Пропускаем экспрессы
          const cardText = $card.text();
          if (cardText.includes('Экспресс') || cardText.includes('экспресс')) {
            return; // Пропускаем этот элемент
          }
          
          const expertName = this.findExpertName($card, $);
          const timestamp = this.findTimestamp($card, $);
          const title = this.findTitle($card, $);
          const comment = this.findComment($card, $);
          const matchInfo = this.findMatchInfo($card, $);
          const prediction = this.findPrediction($card, $);
          const odds = this.findOdds($card, $);
          const avatar = this.findAvatar($card, $);

          // Проверяем, что это валидный прогноз (не экспресс, есть название матча)
          if (expertName && prediction && odds && matchInfo?.teams && matchInfo.teams.length > 5) {
            const isDuplicate = predictions.some(p => 
              p.expertName === expertName && 
              p.prediction === prediction && 
              Math.abs(p.odds - odds) < 0.01 &&
              p.matchInfo?.teams === matchInfo.teams
            );
            
            if (!isDuplicate) {
              predictions.push({
                expertName,
                timestamp,
                title,
                comment,
                matchInfo,
                prediction,
                odds,
                avatar
              });
            }
          }
        });
      }

      // Возвращаем первые 10 прогнозов в порядке появления на странице
      // Первый прогноз на странице = первый в массиве (для "Прогноз дня")
      return predictions.slice(0, this.maxPredictions);
    } catch (error) {
      console.error('Ошибка при парсинге прогнозов:', error);
      throw error;
    }
  }

  /**
   * Альтернативный метод парсинга через более специфичные селекторы
   */
  parseAlternative($) {
    const predictions = [];
    
    // Ищем карточки с временем публикации (time элементы)
    $('time').each((index, element) => {
      const $time = $(element);
        const timestamp = this.findTimestamp($time.closest('div'), $) || 'Недавно';
      
      // Ищем родительский контейнер карточки
      const $card = $time.closest('div').parent().parent();
      
      if ($card.length > 0) {
        const expertName = this.findExpertName($card, $);
        const timestamp = this.findTimestamp($card, $);
        const title = this.findTitle($card, $);
        const comment = this.findComment($card, $);
        const matchInfo = this.findMatchInfo($card, $);
        const prediction = this.findPrediction($card, $);
        const odds = this.findOdds($card, $);
        const avatar = this.findAvatar($card, $);

        if (expertName && prediction && odds) {
          predictions.push({
            expertName,
            timestamp,
            title,
            comment,
            matchInfo,
            prediction,
            odds,
            avatar
          });
        }
      }
    });

    return predictions.slice(0, this.maxPredictions);
  }

  /**
   * Извлекает имя эксперта
   */
  extractExpertName($el, $) {
    // Ищем текст, который выглядит как имя (обычно перед кнопкой "Подписаться")
    const text = $el.text();
    const match = text.match(/([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)/);
    if (match) {
      // Проверяем, что это не название команды
      const name = match[1];
      if (!name.includes('Сити') && !name.includes('Мадрид') && !name.includes('Барселона')) {
        return name;
      }
    }
    return null;
  }

  findExpertName($card, $) {
    // Метод 1: Ищем ссылку на автора
    const $authorLink = $card.find('a[href*="/author/"]');
    if ($authorLink.length > 0) {
      const name = $authorLink.text().trim();
      if (name && name.length > 3) {
        return name;
      }
    }
    
    // Метод 2: Ищем текст перед кнопкой "Подписаться"
    const $subscribeBtn = $card.find('button').filter((i, el) => {
      return $(el).text().includes('Подписаться');
    });
    
    if ($subscribeBtn.length > 0) {
      // Ищем в родительских элементах
      let $parent = $subscribeBtn.parent();
      for (let i = 0; i < 3; i++) {
        const text = $parent.text();
        // Ищем паттерн имени (2 слова с заглавными буквами)
        const match = text.match(/([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)/);
        if (match) {
          const name = match[1];
          // Проверяем, что это не название команды
          if (!name.includes('Сити') && !name.includes('Мадрид') && 
              !name.includes('Барселона') && !name.includes('Ливерпуль') &&
              !name.includes('Арсенал') && !name.includes('Челси')) {
            return name;
          }
        }
        $parent = $parent.parent();
      }
    }
    
    // Метод 3: Ищем в тексте карточки
    const cardText = $card.text();
    const nameMatches = cardText.match(/([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)/g);
    if (nameMatches) {
      for (const match of nameMatches) {
        const name = match.trim();
        if (name.length > 5 && name.length < 30 && 
            !name.includes('прогноз') && !name.includes('ставка') &&
            !name.includes('Подписаться') && !name.includes('Ординар')) {
          return name;
        }
      }
    }
    
    return null;
  }

  /**
   * Извлекает время публикации
   */
  extractTimestamp($el, $) {
    const $time = $el.find('time');
    if ($time.length > 0) {
      return $time.text().trim();
    }
    
    // Ищем текст с временем (формат: "Вчера • 11:35" или "Сегодня • 20:00")
    const text = $el.text();
    const match = text.match(/(Вчера|Сегодня|Вчера|1\s+Дек|2\s+Дек|3\s+Дек)\s*•\s*(\d{1,2}:\d{2})/);
    if (match) {
      return `${match[1]} • ${match[2]}`;
    }
    
    return 'Недавно';
  }

  findTimestamp($card, $) {
    return findTimestampInCard($card, $);
  }

  /**
   * Извлекает заголовок прогноза
   */
  extractTitle($el, $) {
    // Ищем заголовок (обычно содержит "прогноз и ставка")
    const text = $el.text();
    const match = text.match(/([^:]+:\s*прогноз\s+и\s+ставка[^.]*)/);
    if (match) {
      return match[1].trim();
    }
    return null;
  }

  findTitle($card, $) {
    // Метод 1: Ищем заголовок по паттерну "Команда1 — Команда2: прогноз и ставка"
    // Ищем во всех элементах карточки
    const allElements = $card.find('*');
    for (let i = 0; i < allElements.length; i++) {
      const $el = $(allElements[i]);
      const text = $el.text().trim();
      // Проверяем, что текст содержит паттерн заголовка
      if (text.match(/^[^—]+—[^:]+:\s*прогноз\s+и\s+ставка/)) {
        // Проверяем, что это не весь текст карточки (должен быть относительно коротким)
        if (text.length < 200) {
          return text;
        }
      }
    }
    
    // Метод 2: Ищем в структурированных элементах
    const $headings = $card.find('h1, h2, h3, h4, h5, h6');
    for (let i = 0; i < $headings.length; i++) {
      const text = $($headings[i]).text();
      if (text.includes('прогноз') && text.includes('ставка')) {
        return text.trim();
      }
    }
    
    // Метод 3: Ищем в параграфах
    const $paragraphs = $card.find('p');
    for (let i = 0; i < $paragraphs.length; i++) {
      const text = $($paragraphs[i]).text();
      if (text.includes('прогноз') && text.includes('ставка') && text.includes('—')) {
        return text.trim();
      }
    }
    
    return null;
  }

  /**
   * Извлекает комментарий к прогнозу
   */
  extractComment($el, $) {
    const $paragraphs = $el.find('p');
    let comment = '';
    
    $paragraphs.each((index, p) => {
      const text = $(p).text().trim();
      // Пропускаем заголовки и короткие тексты
      if (text.length > 50 && !text.includes('Моя ставка:') && !text.includes('Мой прогноз:')) {
        comment += text + ' ';
      }
    });
    
    return comment.trim() || null;
  }

  findComment($card, $) {
    const $paragraphs = $card.find('p');
    let comment = '';
    
    $paragraphs.each((index, p) => {
      const text = $(p).text().trim();
      if (text.length > 50 && !text.includes('Моя ставка:') && !text.includes('Мой прогноз:')) {
        comment += text + ' ';
      }
    });
    
    return comment.trim() || null;
  }

  /**
   * Извлекает информацию о матче
   */
  extractMatchInfo($el, $) {
    // Ищем информацию о матче (команды, лига, время)
    const text = $el.text();
    const match = text.match(/([А-ЯЁа-яё\s-]+)\s*-\s*([А-ЯЁа-яё\s-]+)\s*(Через\s+\d+\s+час|Сегодня|Вчера)[^•]*•\s*([А-ЯЁа-яё]+)/);
    if (match) {
      return {
        teams: `${match[1].trim()} - ${match[2].trim()}`,
        time: match[3].trim(),
        league: match[4].trim()
      };
    }
    return null;
  }

  findMatchInfo($card, $) {
    // Ищем заголовок (черный жирный текст) и извлекаем название матча из него
    // Заголовок имеет формат: "Команда1 — Команда2: прогноз и ставка. ..."
    const title = this.findTitle($card, $);
    if (title) {
      // Извлекаем название матча до двоеточия
      const colonIndex = title.indexOf(':');
      if (colonIndex > 0) {
        let matchName = title.substring(0, colonIndex).trim();
        
        // Убираем время из начала (например, "Через 53 минуты", "Сегодня", "Вчера")
        matchName = matchName.replace(/^(Через\s+\d+\s+(?:минут|час|часа|часов)(?:ы|а|ов)?|Сегодня|Вчера|Завтра)/i, '').trim();
        
        // Проверяем, что это действительно название матча (содержит " — ")
        if (matchName.includes(' — ')) {
          // Извлекаем команды (оставляем длинное тире)
          const teams = matchName.trim();
          
          // Извлекаем лигу из ссылки, если есть (только для определения лиги, не для названия матча)
          const $matchLink = $card.find('a[href*="/tips/event-"]');
          const href = $matchLink.attr('href') || '';
          let league = '';
          
          if (href.includes('hockey')) {
            league = 'НХЛ';
          } else if (href.includes('basketball') || href.includes('basketbol')) {
            league = 'НБА';
          } else if (href.includes('football') || href.includes('futbol')) {
            if (href.includes('la-liga')) league = 'Ла Лига';
            else if (href.includes('premier-league') || href.includes('english')) league = 'АПЛ';
            else league = 'Чемпионат';
          }
          
          // Время не извлекаем из заголовка, так как оно там не всегда есть
          return {
            teams: teams,
            time: '', // Время не извлекаем из заголовка
            league: league || ''
          };
        }
      }
    }
    
    // Если заголовок не найден, возвращаем null
    // Название матча парсится ТОЛЬКО из черного жирного текста (заголовка)
    return null;
  }

  /**
   * Извлекает прогноз (например, "П2", "ТБ (6)", "Обе забьют: Да")
   */
  extractPrediction($el, $) {
    const text = $el.text();
    // Ищем паттерны прогнозов
    const patterns = [
      /Моя\s+ставка:\s*([^с]+?)(?:\s+с\s+коэффициентом|\s+за\s+\d+\.\d+)/,
      /Мой\s+прогноз:\s*([^с]+?)(?:\s+с\s+коэффициентом|\s+за\s+\d+\.\d+)/,
      /([ПХ12]\d*|ТБ|ТМ|Обе\s+забьют[^:]*:[^.]*|Ф\d+\s*[+-]?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1]?.trim() || match[0].trim();
      }
    }
    
    return null;
  }

  findPrediction($card, $) {
    const text = $card.text();
    
    // Паттерны для поиска прогноза (приоритет сложным прогнозам)
    const patterns = [
      // Сложные прогнозы с периодом (например, "1-я половина - Ф1 (-2)")
      /(?:Моя\s+ставка|Мой\s+прогноз):\s*([^с]+?)(?:\s+с\s+коэффициентом|\s+за\s+\d+\.\d+)/,
      // Простые прогнозы
      /(?:Моя\s+ставка|Мой\s+прогноз):\s*([^.]{2,80})/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let prediction = match[1].trim();
        // Очищаем от лишнего
        prediction = prediction.replace(/\s+с\s+коэффициентом.*$/i, '').trim();
        if (prediction.length > 1 && prediction.length < 100) {
          return prediction;
        }
      }
    }
    
    // Ищем стандартные типы прогнозов (включая сложные)
    const standardPatterns = [
      // Сложные прогнозы с периодом
      /(\d+[-яя]\s+половина\s*-\s*Ф\d+\s*\([^)]+\))/i,
      /(\d+[-яя]\s+четверть\s*-\s*Ф\d+\s*\([^)]+\))/i,
      /(\d+[-йя]\s+гол\s*-\s*[^.]*)/i,
      // Тоталы с периодом
      /(ТБ|ТМ)\s*\([^)]+\)/i,
      // Исходы
      /(П\d+|Х\d+|1X|X2|12)/i,
      // Обе забьют
      /(Обе\s+забьют[^:]*:[^.]*)/i,
      // Форы с коэффициентами в скобках (например, "Ф1 (+2,0)")
      /(Ф\d+\s*\([^)]+\))/i,
      // Форы без скобок (fallback)
      /(Ф\d+\s*[+-]?\d*)/i,
      // Индивидуальные тоталы
      /(ИТБ\d+\s*\([^)]+\)|ИТМ\d+\s*\([^)]+\))/i,
    ];
    
    for (const pattern of standardPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return null;
  }

  /**
   * Извлекает коэффициент
   */
  extractOdds($el, $) {
    const text = $el.text();
    // Ищем коэффициент (формат: число с точкой, например 1.85, 2.20)
    const match = text.match(/(?:коэффициентом|коэф\.?)\s*(\d+\.\d+)/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    // Ищем просто число с точкой
    const oddsMatch = text.match(/\b(\d+\.\d{2})\b/);
    if (oddsMatch) {
      return parseFloat(oddsMatch[1]);
    }
    
    return null;
  }

  findOdds($card, $) {
    const text = $card.text();
    
    // Метод 1: Ищем "коэффициентом X.XX" или "коэф. X.XX"
    const match = text.match(/(?:коэффициентом|коэф\.?)\s*(\d+\.\d{2})/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    // Метод 2: Ищем число после прогноза
    const oddsAfterPrediction = text.match(/(?:П\d+|ТБ|ТМ|Обе\s+забьют|Ф\d+)[^.]*(\d+\.\d{2})/);
    if (oddsAfterPrediction) {
      return parseFloat(oddsAfterPrediction[1]);
    }
    
    // Метод 3: Ищем все числа с форматом X.XX и берем первое разумное
    const allOdds = text.match(/\b(\d+\.\d{2})\b/g);
    if (allOdds) {
      for (const oddsStr of allOdds) {
        const odds = parseFloat(oddsStr);
        // Коэффициенты обычно от 1.10 до 10.00
        if (odds >= 1.10 && odds <= 10.00) {
          return odds;
        }
      }
    }
    
    return null;
  }

  /**
   * Извлекает аватар эксперта
   */
  extractAvatar($el, $) {
    const $img = $el.find('img');
    for (let i = 0; i < $img.length; i++) {
      const src = $($img[i]).attr('src') || $($img[i]).attr('data-src');
      if (src && (src.includes('author') || src.includes('avatar') || src.includes('user'))) {
        return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
      }
    }
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
  }

  findAvatar($card, $) {
    const $img = $card.find('img');
    for (let i = 0; i < $img.length; i++) {
      const src = $($img[i]).attr('src') || $($img[i]).attr('data-src');
      if (src && (src.includes('author') || src.includes('avatar') || src.includes('user'))) {
        return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
      }
    }
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
  }

  /**
   * Преобразует распарсенные данные в формат приложения
   */
  formatPredictions(rawPredictions) {
    return rawPredictions.map((pred, index) => {
      // Определяем дисциплину из лиги
      const discipline = this.getDisciplineFromLeague(pred.matchInfo?.league || '');
      
      // Название матча уже извлечено из заголовка в формате "Команда1 - Команда2"
      // Просто используем его без агрессивной очистки
      let eventName = pred.matchInfo?.teams || pred.title?.split(':')[0] || 'Матч';
      
      // Очищаем лигу от лишнего текста
      let tournament = pred.matchInfo?.league || 'Чемпионат';
      tournament = tournament.replace(/[ПХ12]\d*.*$/, '').trim(); // Удаляем прогноз если попал
      tournament = tournament.replace(/^\s*•\s*/, '').trim(); // Удаляем начальный разделитель
      tournament = tournament.replace(/^[А-ЯЁа-яё]+\s*-\s*[А-ЯЁа-яё]+.*$/, '').trim(); // Удаляем название матча если попал
      
      // Если лига слишком короткая или пустая, определяем по URL или другим признакам
      if (!tournament || tournament.length < 2 || tournament === 'Н') {
        // Пытаемся определить по названию матча или другим признакам
        const eventLower = eventName.toLowerCase();
        if (eventLower.includes('нхл') || eventLower.includes('айлендерс') || eventLower.includes('рейнджерс') || 
            eventLower.includes('флорида') || eventLower.includes('торонто') || eventLower.includes('колорадо') ||
            eventLower.includes('ванкувер') || eventLower.includes('эдмонтон') || eventLower.includes('миннесота') ||
            eventLower.includes('вегас') || eventLower.includes('чикаго') || eventLower.includes('тампа')) {
          tournament = 'НХЛ';
        } else if (eventLower.includes('нба') || eventLower.includes('филадельфия') || eventLower.includes('вашингтон') ||
                   eventLower.includes('сан-антонио') || eventLower.includes('мемфис') || eventLower.includes('бостон') ||
                   eventLower.includes('нью-йорк') || eventLower.includes('селтикс') || eventLower.includes('никс') ||
                   eventLower.includes('голден стэйт') || eventLower.includes('оклахома')) {
          tournament = 'НБА';
        } else if (eventLower.includes('ла лига') || eventLower.includes('атлетик') || eventLower.includes('реал')) {
          tournament = 'Ла Лига';
        } else if (eventLower.includes('апл') || eventLower.includes('вулверхэмптон') || eventLower.includes('ноттингем')) {
          tournament = 'АПЛ';
        } else {
          tournament = 'Чемпионат';
        }
      }
      
      // Определяем дисциплину по турниру (если еще не определена правильно)
      if (discipline === 'Футбол' && (tournament === 'НХЛ' || tournament === 'КХЛ')) {
        discipline = 'Хоккей';
      } else if (discipline === 'Футбол' && tournament === 'НБА') {
        discipline = 'Баскетбол';
      }
      
      return {
        id: Date.now() + index,
        eventName: eventName,
        discipline: discipline,
        tournament: tournament || 'Чемпионат',
        expert: {
          name: pred.expertName || 'Эксперт',
          avatar: pred.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          status: 'expert',
          winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')
        },
        prediction: pred.prediction || 'Прогноз',
        odds: pred.odds || 1.85,
        comment: pred.comment || pred.title || 'Комментарий к прогнозу',
        source: 'Sports Analytics Pro',
        timestamp: pred.timestamp || 'Недавно',
        publishedAt: (() => {
          try {
            if (!pred.timestamp || pred.timestamp === 'Недавно') {
              return new Date().toISOString();
            }
            const date = parseTimestampToDate(pred.timestamp);
            if (isNaN(date.getTime())) {
              console.warn(`Не удалось распарсить время: "${pred.timestamp}"`);
              return new Date().toISOString();
            }
            return date.toISOString();
          } catch (error) {
            console.error(`Ошибка при парсинге времени "${pred.timestamp}":`, error);
            return new Date().toISOString();
          }
        })()
      };
    });
  }

  /**
   * Определяет дисциплину по названию лиги
   */
  getDisciplineFromLeague(league) {
    if (!league) return 'Футбол';
    
    const leagueLower = league.toLowerCase().trim();
    
    // Хоккей
    if (leagueLower.includes('нхл') || leagueLower.includes('кхл') || leagueLower.includes('хоккей')) {
      return 'Хоккей';
    }
    // Баскетбол
    if (leagueLower.includes('нба') || leagueLower.includes('баскетбол')) {
      return 'Баскетбол';
    }
    // Теннис
    if (leagueLower.includes('теннис') || leagueLower.includes('atp') || leagueLower.includes('wta')) {
      return 'Теннис';
    }
    // Футбол
    if (leagueLower.includes('лига') || leagueLower.includes('премьер') || 
        leagueLower.includes('апл') || leagueLower.includes('ла лига') ||
        leagueLower.includes('серия а') || leagueLower.includes('бундеслига') ||
        leagueLower.includes('лига 1') || leagueLower.includes('футбол')) {
      return 'Футбол';
    }
    // Киберспорт
    if (leagueLower.includes('кибер') || leagueLower.includes('esports')) {
      return 'Киберспорт';
    }
    
    return 'Футбол'; // По умолчанию
  }

  /**
   * Получает винрейт эксперта по его имени
   * @param {string} expertName - Имя эксперта
   * @returns {number} - Винрейт от 60 до 80
   */
  getWinRateForExpert(expertName) {
    if (!expertName) return 65;
    
    // Простая хеш-функция для стабильного винрейта для одного эксперта
    let hash = 0;
    for (let i = 0; i < expertName.length; i++) {
      hash = ((hash << 5) - hash) + expertName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Генерируем винрейт от 60 до 80 на основе хеша
    const winRate = 60 + (Math.abs(hash) % 21);
    return winRate;
  }
}

