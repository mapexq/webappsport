import axios from 'axios';
import * as cheerio from 'cheerio';

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

      console.log('Начинаем парсинг прогнозов...');
      const timeElementsCount = $('time').length;
      const linkElementsCount = $('a[href*="/tips/event-"]').length;
      console.log(`Найдено элементов: time=${timeElementsCount}, links=${linkElementsCount}`);

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
        const title = this.findTitle($card, $);
        const comment = this.findComment($card, $);
        const matchInfo = this.findMatchInfo($card, $);
        const prediction = this.findPrediction($card, $);
        const odds = this.findOdds($card, $);
        const avatar = this.findAvatar($card, $);
        const expertStatus = this.findExpertStatus($card, $);

        // Проверяем, что это валидный прогноз
        // Ослабляем валидацию: matchInfo не обязателен, но если есть - проверяем длину
        const hasValidMatchInfo = !matchInfo || (matchInfo.teams && matchInfo.teams.length > 5);
        if (expertName && prediction && odds && hasValidMatchInfo) {
          // Если matchInfo отсутствует, пытаемся извлечь из title
          let finalMatchInfo = matchInfo;
          if (!finalMatchInfo && title) {
            const matchFromTitle = title.split(':')[0].trim();
            if (matchFromTitle.includes(' — ') || matchFromTitle.includes(' - ')) {
              finalMatchInfo = {
                teams: matchFromTitle.replace(' - ', ' — '),
                time: '',
                league: ''
              };
            }
          }
          
          const isDuplicate = predictions.some(p => 
            p.expertName === expertName && 
            p.prediction === prediction && 
            Math.abs(p.odds - odds) < 0.01 &&
            (p.matchInfo?.teams === finalMatchInfo?.teams || (!p.matchInfo?.teams && !finalMatchInfo?.teams))
          );
          
          if (!isDuplicate) {
            predictions.push({
              expertName,
              title,
              comment,
              matchInfo: finalMatchInfo,
              prediction,
              odds,
              avatar,
              expertStatus
            });
          }
        }
      });

      console.log(`После метода 1 (time элементы): найдено ${predictions.length} прогнозов`);

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
          const title = this.findTitle($card, $);
          const comment = this.findComment($card, $);
          const matchInfo = this.findMatchInfo($card, $);
          const prediction = this.findPrediction($card, $);
          const odds = this.findOdds($card, $);
          const avatar = this.findAvatar($card, $);
          const expertStatus = this.findExpertStatus($card, $);

          // Проверяем, что это валидный прогноз (не экспресс, есть название матча)
          // Ослабляем валидацию: matchInfo не обязателен, но если есть - проверяем длину
          const hasValidMatchInfo = !matchInfo || (matchInfo.teams && matchInfo.teams.length > 5);
          if (expertName && prediction && odds && hasValidMatchInfo) {
            // Если matchInfo отсутствует, пытаемся извлечь из title
            let finalMatchInfo = matchInfo;
            if (!finalMatchInfo && title) {
              const matchFromTitle = title.split(':')[0].trim();
              if (matchFromTitle.includes(' — ') || matchFromTitle.includes(' - ')) {
                finalMatchInfo = {
                  teams: matchFromTitle.replace(' - ', ' — '),
                  time: '',
                  league: ''
                };
              }
            }
            
            const isDuplicate = predictions.some(p => 
              p.expertName === expertName && 
              p.prediction === prediction && 
              Math.abs(p.odds - odds) < 0.01 &&
              (p.matchInfo?.teams === finalMatchInfo?.teams || (!p.matchInfo?.teams && !finalMatchInfo?.teams))
            );
            
            if (!isDuplicate) {
              predictions.push({
                expertName,
                title,
                comment,
                matchInfo: finalMatchInfo,
                prediction,
                odds,
                avatar,
                expertStatus
              });
            }
          }
        });
      }

      console.log(`После метода 2 (ссылки на матчи): найдено ${predictions.length} прогнозов`);

      // Метод 3: Если все еще не нашли достаточно, ищем через карточки с прогнозами
      // Ищем элементы, содержащие текст "прогноз" и "ставка" вместе
      if (predictions.length < this.maxPredictions) {
        $('div, article, section').each((index, element) => {
          if (predictions.length >= this.maxPredictions) return false;
          
          const $card = $(element);
          const cardText = $card.text();
          
          // Пропускаем экспрессы и слишком большие/маленькие контейнеры
          if (cardText.includes('Экспресс') || cardText.includes('экспресс') || 
              cardText.length > 3000 || cardText.length < 100) {
            return;
          }
          
          // Проверяем, что это карточка прогноза
          if (!cardText.includes('прогноз') || !cardText.includes('ставка')) {
            return;
          }
          
          // Проверяем, что это не дубликат уже найденной карточки
          const expertName = this.findExpertName($card, $);
          const prediction = this.findPrediction($card, $);
          const odds = this.findOdds($card, $);
          
          if (!expertName || !prediction || !odds) {
            return;
          }
          
          // Проверяем, что имя эксперта не содержит несколько имен (слишком длинное или содержит несколько заглавных букв подряд)
          if (expertName.length > 50 || /[А-ЯЁ][а-яё]+[А-ЯЁ][а-яё]+[А-ЯЁ]/.test(expertName)) {
            return;
          }
          
          // Проверяем, что это не дубликат
          const isDuplicate = predictions.some(p => 
            p.expertName === expertName && 
            p.prediction === prediction && 
            Math.abs(p.odds - odds) < 0.01
          );
          
          if (isDuplicate) {
            return;
          }
          
          // Извлекаем остальные данные
          const title = this.findTitle($card, $);
          const comment = this.findComment($card, $);
          const matchInfo = this.findMatchInfo($card, $);
          const avatar = this.findAvatar($card, $);
          const expertStatus = this.findExpertStatus($card, $);
          
          // Если matchInfo отсутствует, пытаемся извлечь из title
          let finalMatchInfo = matchInfo;
          if (!finalMatchInfo && title) {
            const matchFromTitle = title.split(':')[0].trim();
            if (matchFromTitle.includes(' — ') || matchFromTitle.includes(' - ')) {
              finalMatchInfo = {
                teams: matchFromTitle.replace(' - ', ' — '),
                time: '',
                league: ''
              };
            }
          }
          
          predictions.push({
            expertName,
            title,
            comment,
            matchInfo: finalMatchInfo,
            prediction,
            odds,
            avatar,
            expertStatus
          });
        });
      }

      console.log(`После метода 3 (карточки с прогнозами): найдено ${predictions.length} прогнозов`);

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
      
      // Ищем родительский контейнер карточки
      const $card = $time.closest('div').parent().parent();
      
      if ($card.length > 0) {
        const expertName = this.findExpertName($card, $);
        const title = this.findTitle($card, $);
        const comment = this.findComment($card, $);
        const matchInfo = this.findMatchInfo($card, $);
        const prediction = this.findPrediction($card, $);
        const odds = this.findOdds($card, $);
        const avatar = this.findAvatar($card, $);

        if (expertName && prediction && odds) {
          predictions.push({
            expertName,
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
    // Метод 1: Ищем заголовок по классу (черный жирный текст в начале карточки)
    // Класс: "overflow-hidden text-ellipsis text-base font-bold leading-md"
    const $titleByClass = $card.find('.overflow-hidden.text-ellipsis.text-base.font-bold.leading-md');
    if ($titleByClass.length > 0) {
      // Используем более надежный способ извлечения текста
      // Сначала пробуем получить текст напрямую, затем через все дочерние элементы
      let titleText = $titleByClass.text().trim();
      // Если текст пустой или слишком короткий, пробуем получить через html
      if (!titleText || titleText.length < 10) {
        const html = $titleByClass.html() || '';
        // Извлекаем текст из HTML, удаляя теги
        titleText = html.replace(/<[^>]+>/g, '').trim();
      }
      // Проверяем, что это действительно заголовок (содержит паттерн)
      if (titleText && titleText.match(/[^—]+—[^:]+:\s*прогноз\s+и\s+ставка/)) {
        return titleText;
      }
    }
    
    // Метод 2: Ищем заголовок по паттерну "Команда1 — Команда2: прогноз и ставка"
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
        // Важно: удаляем только если после времени есть пробел или начало названия команды
        // Это предотвращает удаление первой буквы названия команды
        matchName = matchName.replace(/^(Через\s+\d+\s+(?:минут|час|часа|часов)(?:ы|а|ов)?|Сегодня|Вчера|Завтра)(?=\s|[А-ЯЁ])/i, '').trim();
        
        // Проверяем, что это действительно название матча (содержит " — ")
        if (matchName.includes(' — ')) {
          // Извлекаем команды (оставляем длинное тире)
          let teams = matchName.trim();
          
          // Проверка безопасности: убеждаемся, что название начинается с заглавной буквы
          // Если первая буква не заглавная, возможно, мы потеряли первую букву
          // В этом случае попробуем найти полное название в исходном заголовке
          if (teams.length > 0 && !/^[А-ЯЁA-Z]/.test(teams)) {
            // Пытаемся найти полное название в исходном заголовке
            const fullMatch = title.match(/([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z\s-]+?\s*—\s*[А-ЯЁA-Z][А-ЯЁа-яёA-Za-z\s-]+?)(?::|$)/);
            if (fullMatch && fullMatch[1]) {
              teams = fullMatch[1].trim();
            }
          }
          
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
    
    // Метод 2: Если заголовок не найден, ищем название матча в тексте карточки
    const cardText = $card.text();
    // Ищем паттерн "Команда1 — Команда2" или "Команда1 - Команда2"
    const matchPattern = cardText.match(/([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z\s-]+?)\s*[—\-]\s*([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z\s-]+?)(?:\s*:|$)/);
    if (matchPattern && matchPattern[1] && matchPattern[2]) {
      const teams = `${matchPattern[1].trim()} — ${matchPattern[2].trim()}`;
      
      // Извлекаем лигу из ссылки, если есть
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
      
      return {
        teams: teams,
        time: '',
        league: league || ''
      };
    }
    
    // Если ничего не найдено, возвращаем null
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
    // Метод 1: Ищем элемент с SVG часов (эмодзи часов) и берем весь текст после него
    // SVG имеет href="/static/sprite-group/bet.svg#time" или похожий
    const $timeIcon = $card.find('svg use[href*="bet.svg#time"], svg use[href*="time"], svg[class*="time"], use[href*="bet.svg#time"], use[href*="time"]');
    
    if ($timeIcon.length > 0) {
      // Находим родительский элемент, содержащий SVG и текст прогноза
      let $predictionContainer = $timeIcon.closest('div, span, p, a');
      
      if ($predictionContainer.length > 0) {
        // Получаем весь HTML контейнера
        const html = $predictionContainer.html() || '';
        
        // Удаляем SVG из HTML, оставляя только текст
        const textWithoutSvg = html
          .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '') // Удаляем SVG теги
          .replace(/<use[^>]*>/gi, '') // Удаляем use теги
          .replace(/<[^>]+>/g, ' ') // Удаляем все остальные HTML теги
          .replace(/\s+/g, ' ') // Нормализуем пробелы
          .trim();
        
        // Если нашли текст, возвращаем его целиком
        if (textWithoutSvg && textWithoutSvg.length > 0) {
          // Убираем возможные лишние части (коэффициент, если он есть в конце)
          // Но оставляем весь текст прогноза, включая сложные варианты
          let prediction = textWithoutSvg;
          
          // Удаляем коэффициент в конце, если он есть (формат: "1.80" или "коэф. 1.80")
          prediction = prediction.replace(/\s*(?:коэф\.?|коэффициентом)\s*\d+\.\d+\s*$/i, '').trim();
          prediction = prediction.replace(/\s+\d+\.\d{2}\s*$/, '').trim();
          
          if (prediction.length > 0) {
            return prediction;
          }
        }
        
        // Альтернативный способ: берем весь текстовый контент элемента
        const fullText = $predictionContainer.text().trim();
        if (fullText && fullText.length > 0) {
          // Удаляем время из начала, если оно есть
          let prediction = fullText.replace(/^Через\s+\d+\s+(?:минут|час|часа|часов)[^•]*•\s*[^•]*•\s*/i, '').trim();
          
          // Удаляем коэффициент в конце
          prediction = prediction.replace(/\s*(?:коэф\.?|коэффициентом)\s*\d+\.\d+\s*$/i, '').trim();
          prediction = prediction.replace(/\s+\d+\.\d{2}\s*$/, '').trim();
          
          if (prediction.length > 0) {
            return prediction;
          }
        }
      }
    }
    
    // Метод 2: Ищем элемент, который идет после элемента с временем "Через X минут"
    const $timeElements = $card.find('*').filter((i, el) => {
      const text = $(el).text() || '';
      return text.includes('Через') && (text.includes('минут') || text.includes('час'));
    });
    
    if ($timeElements.length > 0) {
      // Берем первый элемент с временем
      const $timeEl = $($timeElements[0]);
      
      // Ищем следующий элемент с прогнозом
      let $next = $timeEl.next();
      let attempts = 0;
      
      while ($next.length > 0 && attempts < 5) {
        const nextText = $next.text().trim();
        
        // Проверяем, содержит ли элемент прогноз
        if (nextText && (nextText.includes('П') || nextText.includes('ТБ') || nextText.includes('ТМ') || 
            nextText.includes('Ф') || nextText.includes('Обе') || nextText.includes('ИТБ') || nextText.includes('ИТМ'))) {
          // Удаляем коэффициент, если он есть
          let prediction = nextText.replace(/\s+\d+\.\d{2}\s*$/, '').trim();
          if (prediction.length > 0) {
            return prediction;
          }
        }
        
        $next = $next.next();
        attempts++;
      }
      
      // Если не нашли в следующем элементе, ищем в родителе
      let $parent = $timeEl.parent();
      for (let i = 0; i < 3 && $parent.length > 0; i++) {
        const parentText = $parent.text() || '';
        
        // Ищем прогноз после времени в тексте родителя
        const match = parentText.match(/Через\s+\d+\s+(?:минут|час|часа|часов)[^•]*•\s*[^•]*•\s*([А-ЯЁа-яё\s\d\(\)\-\+ПХ12ТБМ,\.иилиили]+?)(?:\s+\d+\.\d{2})?/i);
        if (match && match[1]) {
          let prediction = match[1].trim();
          // Удаляем коэффициент в конце
          prediction = prediction.replace(/\s+\d+\.\d{2}\s*$/, '').trim();
          if (prediction.length > 0) {
            return prediction;
          }
        }
        
        $parent = $parent.parent();
      }
    }
    
    // Метод 3: Fallback - ищем полный текст после "Моя ставка:" или "Мой прогноз:"
    const text = $card.text();
    const fullTextPatterns = [
      /(?:Моя\s+ставка|Мой\s+прогноз):\s*([^с]+?)(?:\s+с\s+коэффициентом|\s+за\s+\d+\.\d+)/i,
      /(?:Моя\s+ставка|Мой\s+прогноз):\s*([^.]{1,200})/i,
    ];
    
    for (const pattern of fullTextPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let predictionText = match[1].trim();
        predictionText = predictionText.replace(/\s+с\s+коэффициентом.*$/i, '').trim();
        if (predictionText.length > 1) {
          return predictionText;
        }
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

  /**
   * Определяет статус эксперта (эксперт или каппер)
   */
  findExpertStatus($card, $) {
    // Временно добавляем логирование для отладки
    const debugExpertName = this.findExpertName($card, $);
    if (debugExpertName) {
      // Ищем все элементы, содержащие имя эксперта и статус
      const $nameContainer = $card.find('*').filter((i, el) => {
        return $(el).text().includes(debugExpertName);
      }).first();
      
      if ($nameContainer.length > 0) {
        const containerHtml = $nameContainer.html() || '';
        const containerText = $nameContainer.text();
        
        // Логируем для первых нескольких карточек
        if (debugExpertName && (debugExpertName.includes('Ткабладзе') || debugExpertName.includes('Леоненко') || debugExpertName.includes('Тимофеев'))) {
          console.log(`\n[DEBUG] Эксперт: ${debugExpertName}`);
          console.log(`[DEBUG] HTML контейнера (первые 500 символов):`, containerHtml.substring(0, 500));
          console.log(`[DEBUG] Текст контейнера (первые 300 символов):`, containerText.substring(0, 300));
        }
      }
    }
    // Метод 1: Ищем статус рядом с именем эксперта (в контейнере с автором)
    const $authorLink = $card.find('a[href*="/author/"]');
    if ($authorLink.length > 0) {
      // Ищем в родительских контейнерах автора
      let $container = $authorLink.closest('div');
      for (let i = 0; i < 5; i++) {
        const containerText = $container.text();
        
        // Ищем статус "Каппер" (приоритет выше, так как он более специфичен)
        if (containerText.match(/\bКаппер\b/i) || containerText.match(/\bкаппер\b/i)) {
          return 'capper';
        }
        
        // Ищем статус "Эксперт"
        if (containerText.match(/\bЭксперт\b/i) || containerText.match(/\bэксперт\b/i)) {
          return 'expert';
        }
        
        // Ищем в дочерних элементах контейнера
        const $statusElements = $container.find('span, div, p, label').filter((i, el) => {
          const text = $(el).text().trim();
          return text === 'Каппер' || text === 'каппер' || 
                 text === 'Эксперт' || text === 'эксперт' ||
                 text === 'Capper' || text === 'capper' ||
                 text === 'Expert' || text === 'expert';
        });
        
        if ($statusElements.length > 0) {
          const statusText = $($statusElements[0]).text().trim().toLowerCase();
          if (statusText.includes('каппер') || statusText.includes('capper')) {
            return 'capper';
          }
          if (statusText.includes('эксперт') || statusText.includes('expert')) {
            return 'expert';
          }
        }
        
        $container = $container.parent();
      }
    }
    
    // Метод 2: Ищем статус в элементах с классом или атрибутом, указывающим на статус
    const $statusBadges = $card.find('[class*="status"], [class*="badge"], [class*="role"], [class*="type"]');
    for (let i = 0; i < $statusBadges.length; i++) {
      const $badge = $($statusBadges[i]);
      const badgeText = $badge.text().trim().toLowerCase();
      
      if (badgeText.includes('каппер') || badgeText.includes('capper')) {
        return 'capper';
      }
      if (badgeText.includes('эксперт') || badgeText.includes('expert')) {
        return 'expert';
      }
    }
    
    // Метод 3: Ищем текст "Каппер" или "Эксперт" в карточке (более точный поиск)
    const cardText = $card.text();
    
    // Используем регулярные выражения для более точного поиска
    const capperMatch = cardText.match(/\b(Каппер|каппер|Capper|capper)\b/i);
    const expertMatch = cardText.match(/\b(Эксперт|эксперт|Expert|expert)\b/i);
    
    // Приоритет капперу, так как он более специфичен
    if (capperMatch) {
      return 'capper';
    }
    if (expertMatch) {
      return 'expert';
    }
    
    // Метод 4: Ищем в тексте рядом с именем эксперта (в пределах небольшого контекста)
    const expertName = this.findExpertName($card, $);
    if (expertName) {
      // Ищем элементы, содержащие имя эксперта
      const $nameElements = $card.find('*').filter((i, el) => {
        return $(el).text().includes(expertName);
      });
      
      for (let i = 0; i < $nameElements.length && i < 3; i++) {
        const $nameEl = $($nameElements[i]);
        const nameContext = $nameEl.text();
        
        // Ищем статус в контексте имени (в пределах 200 символов)
        const nameIndex = nameContext.indexOf(expertName);
        if (nameIndex >= 0) {
          const contextBefore = nameContext.substring(Math.max(0, nameIndex - 100), nameIndex);
          const contextAfter = nameContext.substring(nameIndex + expertName.length, nameIndex + expertName.length + 100);
          const fullContext = contextBefore + contextAfter;
          
          if (fullContext.match(/\b(Каппер|каппер)\b/i)) {
            return 'capper';
          }
          if (fullContext.match(/\b(Эксперт|эксперт)\b/i)) {
            return 'expert';
          }
        }
      }
    }
    
    // По умолчанию возвращаем 'expert' (для обратной совместимости)
    return 'expert';
  }

  findAvatar($card, $) {
    // Метод 1: Ищем аватар рядом с именем эксперта (в контейнере со ссылкой на автора)
    const $authorLink = $card.find('a[href*="/author/"]');
    if ($authorLink.length > 0) {
      // Ищем изображение в том же контейнере или рядом
      let $authorContainer = $authorLink.closest('div');
      for (let i = 0; i < 3; i++) {
        const $img = $authorContainer.find('img');
        for (let j = 0; j < $img.length; j++) {
          const $currentImg = $($img[j]);
          // Проверяем все возможные атрибуты для lazy loading
          const src = $currentImg.attr('src') || 
                     $currentImg.attr('data-src') || 
                     $currentImg.attr('data-lazy-src') ||
                     ($currentImg.attr('data-srcset') && $currentImg.attr('data-srcset').split(' ')[0]);
          
          if (src) {
            // Проверяем, что это не логотип команды или другой элемент
            const imgClass = $currentImg.attr('class') || '';
            const imgAlt = ($currentImg.attr('alt') || '').toLowerCase();
            
            // Пропускаем логотипы команд и другие изображения
            if (imgAlt.includes('логотип') || imgAlt.includes('logo') || 
                imgAlt.includes('команда') || imgAlt.includes('team') ||
                imgClass.includes('logo') || imgClass.includes('flag')) {
              continue;
            }
            
            // Если изображение круглое или маленькое (вероятно аватар)
            if (imgClass.includes('rounded-full') || imgClass.includes('rounded') ||
                $currentImg.attr('width') === '40' || $currentImg.attr('width') === '48' ||
                $currentImg.attr('width') === '64' || $currentImg.attr('height') === '40' ||
                $currentImg.attr('height') === '48' || $currentImg.attr('height') === '64') {
              return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
            }
            
            // Если URL содержит признаки аватара
            if (src.includes('author') || src.includes('avatar') || src.includes('user') ||
                src.includes('profile') || src.includes('expert')) {
              return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
            }
          }
        }
        $authorContainer = $authorContainer.parent();
      }
    }
    
    // Метод 2: Ищем все изображения в карточке и фильтруем по признакам аватара
    const $allImgs = $card.find('img');
    for (let i = 0; i < $allImgs.length; i++) {
      const $img = $($allImgs[i]);
      const src = $img.attr('src') || 
                 $img.attr('data-src') || 
                 $img.attr('data-lazy-src') ||
                 ($img.attr('data-srcset') && $img.attr('data-srcset').split(' ')[0]);
      
      if (!src) continue;
      
      const imgClass = $img.attr('class') || '';
      const imgAlt = ($img.attr('alt') || '').toLowerCase();
      const width = parseInt($img.attr('width') || '0');
      const height = parseInt($img.attr('height') || '0');
      
      // Пропускаем логотипы и большие изображения
      if (imgAlt.includes('логотип') || imgAlt.includes('logo') || 
          imgAlt.includes('команда') || imgAlt.includes('team') ||
          imgClass.includes('logo') || imgClass.includes('flag') ||
          (width > 100 || height > 100)) {
        continue;
      }
      
      // Признаки аватара: круглое, маленькое, или URL содержит ключевые слова
      if (imgClass.includes('rounded-full') || 
          (width > 0 && width <= 80 && height > 0 && height <= 80) ||
          src.includes('author') || src.includes('avatar') || src.includes('user') ||
          src.includes('profile') || src.includes('expert')) {
        return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
      }
    }
    
    // Метод 3: Ищем изображения в контейнере с кнопкой "Подписаться" (обычно там аватар)
    const $subscribeBtn = $card.find('button').filter((i, el) => {
      return $(el).text().includes('Подписаться');
    });
    
    if ($subscribeBtn.length > 0) {
      let $container = $subscribeBtn.closest('div');
      for (let i = 0; i < 3; i++) {
        const $img = $container.find('img');
        for (let j = 0; j < $img.length; j++) {
          const $currentImg = $($img[j]);
          const src = $currentImg.attr('src') || 
                     $currentImg.attr('data-src') || 
                     $currentImg.attr('data-lazy-src') ||
                     ($currentImg.attr('data-srcset') && $currentImg.attr('data-srcset').split(' ')[0]);
          
          if (src && !src.includes('logo') && !src.includes('flag')) {
            const width = parseInt($currentImg.attr('width') || '0');
            const height = parseInt($currentImg.attr('height') || '0');
            if (width <= 80 && height <= 80) {
              return src.startsWith('http') ? src : `https://bookmaker-ratings.ru${src}`;
            }
          }
        }
        $container = $container.parent();
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
          status: pred.expertStatus || 'expert',
          winRate: this.getWinRateForExpert(pred.expertName || 'Эксперт')
        },
        prediction: pred.prediction || 'Прогноз',
        odds: pred.odds || 1.85,
        comment: pred.comment || pred.title || 'Комментарий к прогнозу',
        source: 'Sports Analytics Pro',
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
   * @returns {number} - Винрейт от 68 до 89
   */
  getWinRateForExpert(expertName) {
    if (!expertName) return 75;
    
    // Простая хеш-функция для стабильного винрейта для одного эксперта
    let hash = 0;
    for (let i = 0; i < expertName.length; i++) {
      hash = ((hash << 5) - hash) + expertName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Генерируем винрейт от 68 до 89 на основе хеша
    const winRate = 68 + (Math.abs(hash) % 22);
    return winRate;
  }
}

