import { useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

/**
 * Хук для автоматического обновления новостей при заходе в приложение
 * Работает аналогично обновлению прогнозов
 */
export function useNewsRefresh() {
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Обновляем новости только один раз при загрузке приложения
    if (hasRefreshed.current) return;

    const refreshNewsOnAppStart = async () => {
      try {
        // Проверяем время последнего обновления
        const { lastUpdate } = await apiService.getNewsLastUpdate();
        
        if (lastUpdate) {
          const lastUpdateTime = new Date(lastUpdate).getTime();
          const now = Date.now();
          const diffMinutes = (now - lastUpdateTime) / 60000;

          // Если прошло больше 30 минут, обновляем автоматически
          if (diffMinutes > 30) {
            logger.log('Автоматическое обновление новостей при заходе в приложение');
            await apiService.refreshNews();
          }
        } else {
          // Если нет данных о последнем обновлении, обновляем
          logger.log('Автоматическое обновление новостей (нет данных о последнем обновлении)');
          await apiService.refreshNews();
        }
        
        hasRefreshed.current = true;
      } catch (error) {
        logger.error('Ошибка при автоматическом обновлении новостей:', error);
        // Не показываем ошибку пользователю, просто логируем
      }
    };

    refreshNewsOnAppStart();
  }, []);
}

