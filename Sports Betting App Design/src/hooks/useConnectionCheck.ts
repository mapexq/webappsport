import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { checkConnection } from '../services/connectionCheck';
import { logger } from '../utils/logger';

/**
 * Хук для проверки подключения к интернету
 * Показывает плашку только если интернет отсутствует стабильно (10+ секунд)
 */
export function useConnectionCheck() {
  const { setConnectionIssue } = useAppStore();
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // При первой загрузке — проверяем только navigator.onLine
    // Не делаем fetch-проверку, чтобы не блокировать при слабом интернете
    if (!navigator.onLine) {
      logger.log('📴 Нет интернета при загрузке');
      setConnectionIssue('offline');
    }

    const handleOffline = () => {
      logger.log('📴 Событие offline — ждём 10 секунд перед показом плашки...');
      // Не показываем сразу — ждём 10 секунд
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = setTimeout(() => {
        // Проверяем ещё раз — всё ещё offline?
        if (!navigator.onLine) {
          logger.log('📴 Интернет отсутствует 10+ секунд — показываем плашку');
          setConnectionIssue('offline');
        }
      }, 10000);
    };

    const handleOnline = () => {
      logger.log('🌐 Событие online — убираем таймер и плашку');
      // Отменяем таймер если интернет вернулся
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
      // Автоматически убираем плашку при восстановлении
      setConnectionIssue(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    };
  }, [setConnectionIssue]);
}
