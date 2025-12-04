// Сервис для проверки подключения к интернету

import { logger } from '../utils/logger';

type ConnectionIssue = 'offline' | null;

/**
 * Проверяет наличие активного подключения к интернету
 */
export async function checkInternetConnection(): Promise<boolean> {
  // Проверка через navigator.onLine
  if (!navigator.onLine) {
    return false;
  }

  // Дополнительная проверка через fetch к надежному ресурсу
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    // Если fetch не удался, пробуем альтернативный способ
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Основная функция проверки подключения
 * Возвращает тип проблемы или null, если все в порядке
 */
export async function checkConnection(): Promise<ConnectionIssue> {
  // Проверяем интернет
  const hasInternet = await checkInternetConnection();
  
  if (!hasInternet) {
    logger.log('⚠️ Нет подключения к интернету');
    return 'offline';
  }

  logger.log('✅ Подключение к интернету есть');
  return null;
}
