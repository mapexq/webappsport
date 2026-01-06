/**
 * Утилиты для работы с временными метками прогнозов
 */

/**
 * Проверяет, является ли текст валидной временной меткой
 */
export function isValidTimestamp(text) {
  if (!text || text.length < 5) return false;
  
  const patterns = [
    /^(Сегодня|Вчера)\s*•\s*\d{1,2}:\d{2}$/,
    /^\d+\s+[А-ЯЁа-яё]+\s*•\s*\d{1,2}:\d{2}$/, // "1 Дек • 12:47"
    /^\d+\s+час(?:а|ов)?\s+назад$/,
    /^\d+\s+минут(?:ы|а|)?\s+назад$/
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Преобразует текстовую временную метку в Date объект
 * @param {string} timestampText - Текст времени, например "Сегодня • 14:07"
 * @returns {Date} - Date объект
 */
export function parseTimestampToDate(timestampText) {
  if (!timestampText) return new Date(); // По умолчанию текущее время
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Паттерн: "Сегодня • HH:MM"
  const todayMatch = timestampText.match(/^Сегодня\s*•\s*(\d{1,2}):(\d{2})$/);
  if (todayMatch) {
    const hours = parseInt(todayMatch[1], 10);
    const minutes = parseInt(todayMatch[2], 10);
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  // Паттерн: "Вчера • HH:MM"
  const yesterdayMatch = timestampText.match(/^Вчера\s*•\s*(\d{1,2}):(\d{2})$/);
  if (yesterdayMatch) {
    const hours = parseInt(yesterdayMatch[1], 10);
    const minutes = parseInt(yesterdayMatch[2], 10);
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  // Паттерн: "N Дек • HH:MM" или "N [месяц] • HH:MM"
  const dateMatch = timestampText.match(/^(\d+)\s+([А-ЯЁа-яё]+)\s*•\s*(\d{1,2}):(\d{2})$/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const monthName = dateMatch[2];
    const hours = parseInt(dateMatch[3], 10);
    const minutes = parseInt(dateMatch[4], 10);
    
    // Маппинг русских названий месяцев
    const monthMap = {
      'Янв': 0, 'Фев': 1, 'Мар': 2, 'Апр': 3, 'Май': 4, 'Июн': 5,
      'Июл': 6, 'Авг': 7, 'Сен': 8, 'Окт': 9, 'Ноя': 10, 'Дек': 11,
      'Января': 0, 'Февраля': 1, 'Марта': 2, 'Апреля': 3, 'Мая': 4, 'Июня': 5,
      'Июля': 6, 'Августа': 7, 'Сентября': 8, 'Октября': 9, 'Ноября': 10, 'Декабря': 11
    };
    
    const month = monthMap[monthName];
    if (month !== undefined) {
      const year = now.getFullYear();
      const date = new Date(year, month, day, hours, minutes, 0, 0);
      // Если дата в будущем, значит это прошлый год
      if (date > now) {
        date.setFullYear(year - 1);
      }
      return date;
    }
  }
  
  // Паттерн: "N часов назад"
  const hoursAgoMatch = timestampText.match(/^(\d+)\s+час(?:а|ов)?\s+назад$/);
  if (hoursAgoMatch) {
    const hoursAgo = parseInt(hoursAgoMatch[1], 10);
    const date = new Date(now);
    date.setHours(date.getHours() - hoursAgo);
    return date;
  }
  
  // Паттерн: "N минут назад"
  const minutesAgoMatch = timestampText.match(/^(\d+)\s+минут(?:ы|а|)?\s+назад$/);
  if (minutesAgoMatch) {
    const minutesAgo = parseInt(minutesAgoMatch[1], 10);
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date;
  }
  
  // Если не удалось распарсить, возвращаем текущее время
  return new Date();
}

/**
 * Извлекает временную метку из карточки прогноза
 * @param {Cheerio} $card - Cheerio объект карточки
 * @param {Cheerio} $ - Cheerio объект документа
 * @returns {string|null} - Текст временной метки или null
 */
export function findTimestampInCard($card, $) {
  if (!$card || $card.length === 0) {
    return null;
  }
  
  // Метод 1: Ищем в элементах time
  const $timeElements = $card.find('time');
  for (let i = 0; i < $timeElements.length; i++) {
    const text = $($timeElements[i]).text().trim();
    if (isValidTimestamp(text)) {
      return text;
    }
  }
  
  // Метод 2: Ищем в тексте карточки паттерн времени
  const cardText = $card.text();
  const timePatterns = [
    /(Сегодня|Вчера|\d+\s+[А-ЯЁа-яё]+)\s*•\s*\d{1,2}:\d{2}/,
    /(\d+\s+час(?:а|ов)?\s+назад)/,
    /(\d+\s+минут(?:ы|а|)?\s+назад)/
  ];
  
  for (const pattern of timePatterns) {
    const match = cardText.match(pattern);
    if (match && match[0]) {
      const found = match[0].trim();
      if (isValidTimestamp(found)) {
        return found;
      }
    }
  }
  
  // Метод 3: Ищем в span элементах с текстом времени (более точный поиск)
  // Ищем элементы, которые содержат только текст времени
  const $allElements = $card.find('span, div, p, time');
  for (let i = 0; i < $allElements.length; i++) {
    const $el = $($allElements[i]);
    const text = $el.text().trim();
    // Проверяем, что это прямой текст элемента (не включая дочерние)
    if (isValidTimestamp(text) && $el.children().length === 0) {
      return text;
    }
  }
  
  return null;
}

