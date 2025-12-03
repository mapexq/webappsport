/**
 * Форматирует дату в относительное время
 * @param date - Date объект или строка ISO
 * @returns Отформатированная строка времени
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return 'Недавно';
  }
  
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  // Меньше минуты
  if (diffInSeconds < 60) {
    return `${diffInSeconds} секунд назад`;
  }
  
  // Меньше часа
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getMinutesWord(diffInMinutes)} назад`;
  }
  
  // Меньше 24 часов
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${getHoursWord(diffInHours)} назад`;
  }
  
  // Сегодня
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffInDays = Math.floor((today.getTime() - targetDay.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    // Сегодня
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    return `Сегодня • ${hours}:${minutes}`;
  }
  
  if (diffInDays === 1) {
    // Вчера
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    return `Вчера • ${hours}:${minutes}`;
  }
  
  // Старше 2 дней - показываем дату
  const day = targetDate.getDate().toString().padStart(2, '0');
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const year = targetDate.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Возвращает правильную форму слова "минута"
 */
function getMinutesWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'минут';
  }
  
  if (lastDigit === 1) {
    return 'минуту';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'минуты';
  }
  
  return 'минут';
}

/**
 * Возвращает правильную форму слова "час"
 */
function getHoursWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'часов';
  }
  
  if (lastDigit === 1) {
    return 'час';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'часа';
  }
  
  return 'часов';
}

