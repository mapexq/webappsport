// API Service layer for the Sports Betting App
// Currently using mock data, but structured for easy API integration

/// <reference types="../vite-env" />
import type { Bookmaker, Prediction, News, Article } from '../types';
import { logger } from '../utils/logger';

// Mock data - in production, these would be API calls
const mockBookmakers: Bookmaker[] = [
  {
    id: 1,
    name: 'PARI',
    logo: 'PR',
    rating: 4.8,
    bonus: 'До 5 000 ₽ Фрибет',
    bonusAmount: 5000,
    features: ['Быстрая регистрация', 'Программа лояльности', 'Киберспорт линии'],
    license: 'Лицензия ФНС России',
  },
  // Add more bookmakers as needed
];

const mockPredictions: Prediction[] = [
  {
    id: 1,
    eventName: 'Манчестер Сити - Ливерпуль',
    discipline: 'Футбол',
    tournament: 'Английская Премьер-Лига',
    expert: {
      name: 'Дмитрий Волков',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      status: 'expert',
      winRate: 73,
    },
    prediction: 'Обе забьют: Да',
    odds: 1.85,
    comment: 'Оба клуба показывают отличную атакующую игру.',
    source: 'Sports Analytics Pro',
    timestamp: '2 часа назад',
  },
  // Add more predictions as needed
];

const mockNews: News[] = [];
const mockArticles: Article[] = [];

// GitHub репозиторий для данных (можно настроить через переменные окружения)
// Формат: username/repo-name или полный URL
// Fallback на ваш репозиторий для работы в APK
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'mapexq/webappsport';
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
const GITHUB_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data`;

// Логирование только в режиме разработки
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    GITHUB_REPO,
    GITHUB_BRANCH,
    GITHUB_DATA_URL,
    hasEnv: !!import.meta.env.VITE_GITHUB_REPO,
  });
}

// API base URL для локального сервера (fallback)
// В production/Capacitor не используем localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : null);
const isLocalhost = API_BASE_URL?.includes('localhost') || API_BASE_URL?.includes('127.0.0.1');

// API Service functions
export const apiService = {
  // Bookmakers
  async getBookmakers(): Promise<Bookmaker[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockBookmakers;
  },

  async getBookmakersConfig(): Promise<Partial<Bookmaker>[]> {
    try {
      if (GITHUB_DATA_URL) {
        // Use more aggressive cache busting with double timestamp and random string
        const salt = Math.random().toString(36).substring(7);
        const url = `${GITHUB_DATA_URL}/bookmakers.json?v=${Date.now()}&s=${salt}`;
        
        logger.log('📡 Загрузка конфигурации БК с GitHub (aggressive):', url);
        
        const response = await fetch(url, {
          cache: 'no-store', // Force browser/WebView to skip cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          logger.log('✅ Конфигурация БК загружена успешно');
          return data;
        }
      }
    } catch (e) {
      logger.error('❌ Ошибка при загрузке конфига БК:', e);
    }
    return [];
  },

  async getBookmakerById(id: number): Promise<Bookmaker | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockBookmakers.find((b) => b.id === id) || null;
  },

  // Predictions - использует GitHub или backend API
  async getPredictions(): Promise<Prediction[]> {
    try {
      // Приоритет: GitHub > API > Mock
      if (GITHUB_DATA_URL) {
        const url = `${GITHUB_DATA_URL}/predictions.json`;
        logger.log('📡 Загрузка прогнозов с GitHub:', url);
        const response = await fetch(url);
        logger.log('📡 Ответ GitHub:', { status: response.status, ok: response.ok, url });
        if (response.ok) {
          const data = await response.json();
          logger.log('✅ Прогнозы загружены с GitHub:', data.length, 'шт.');
          return data;
        } else {
          logger.warn('⚠️ GitHub недоступен, статус:', response.status, response.statusText);
        }
        // Если GitHub недоступен, пробуем API
      } else {
        logger.warn('⚠️ GITHUB_DATA_URL не настроен, используем fallback');
      }
      
      // Fallback на API сервер (только если не localhost)
      if (API_BASE_URL && !isLocalhost) {
        logger.log('📡 Попытка загрузки с API:', API_BASE_URL);
        try {
          const response = await fetch(`${API_BASE_URL}/predictions`);
          if (response.ok) {
            const data = await response.json();
            logger.log('✅ Прогнозы загружены с API:', data.length, 'шт.');
            return data;
          }
        } catch (apiError) {
          logger.warn('⚠️ API недоступен, используем mock данные');
        }
      }
      
      throw new Error('Ошибка при получении прогнозов');
    } catch (error) {
      logger.error('❌ Ошибка при получении прогнозов:', error);
      logger.log('🔄 Используем моковые данные');
      // Fallback на моковые данные при ошибке
      return mockPredictions;
    }
  },

  async refreshPredictions(): Promise<Prediction[]> {
    try {
      // Если используем GitHub, просто перезагружаем данные
      if (GITHUB_DATA_URL) {
        // Добавляем timestamp для обхода кэша
        const response = await fetch(`${GITHUB_DATA_URL}/predictions.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      }
      
      // Fallback на API сервер (только если не localhost)
      if (API_BASE_URL && !isLocalhost) {
        try {
          const response = await fetch(`${API_BASE_URL}/predictions/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            return data.predictions || data;
          }
        } catch (apiError) {
          logger.warn('⚠️ API недоступен при обновлении');
        }
      }
      
      // Если API недоступен, возвращаем текущие данные из GitHub или mock
      return await this.getPredictions();
    } catch (error) {
      logger.error('Ошибка при обновлении прогнозов:', error);
      throw error;
    }
  },

  async getPredictionById(id: number): Promise<Prediction | null> {
    try {
      const predictions = await this.getPredictions();
      return predictions.find((p) => p.id === id) || null;
    } catch (error) {
      logger.error('Ошибка при получении прогноза:', error);
      return null;
    }
  },

  // News - использует GitHub или backend API
  async getNews(): Promise<any[]> {
    try {
      // Приоритет: GitHub > API > Mock
      if (GITHUB_DATA_URL) {
        const url = `${GITHUB_DATA_URL}/news.json`;
        logger.log('📡 Загрузка новостей с GitHub:', url);
        const response = await fetch(url);
        logger.log('📡 Ответ GitHub:', { status: response.status, ok: response.ok, url });
        if (response.ok) {
          const data = await response.json();
          logger.log('✅ Новости загружены с GitHub:', data.length, 'шт.');
          return data;
        } else {
          logger.warn('⚠️ GitHub недоступен, статус:', response.status, response.statusText);
        }
        // Если GitHub недоступен, пробуем API
      } else {
        logger.warn('⚠️ GITHUB_DATA_URL не настроен, используем fallback');
      }
      
      // Fallback на API сервер (только если не localhost)
      if (API_BASE_URL && !isLocalhost) {
        logger.log('📡 Попытка загрузки с API:', API_BASE_URL);
        try {
          const response = await fetch(`${API_BASE_URL}/news`);
          if (response.ok) {
            const data = await response.json();
            logger.log('✅ Новости загружены с API:', data.length, 'шт.');
            return data;
          }
        } catch (apiError) {
          logger.warn('⚠️ API недоступен, используем mock данные');
        }
      }
      
      throw new Error('Ошибка при получении новостей');
    } catch (error) {
      logger.error('❌ Ошибка при получении новостей:', error);
      return [];
    }
  },

  async refreshNews(): Promise<{ success: boolean; count: number; news: any[]; updated?: boolean }> {
    try {
      // Если используем GitHub, просто перезагружаем данные
      if (GITHUB_DATA_URL) {
        // Добавляем timestamp для обхода кэша
        const response = await fetch(`${GITHUB_DATA_URL}/news.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            count: data.length,
            news: data,
            updated: true,
          };
        }
      }
      
      // Fallback на API сервер (только если не localhost)
      if (API_BASE_URL && !isLocalhost) {
        try {
          const response = await fetch(`${API_BASE_URL}/news/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch (apiError) {
          logger.warn('⚠️ API недоступен при обновлении');
        }
      }
      
      // Если API недоступен, возвращаем текущие данные из GitHub
      const news = await this.getNews();
      return {
        success: true,
        count: news.length,
        news: news,
        updated: false,
      };
    } catch (error) {
      logger.error('Ошибка при обновлении новостей:', error);
      throw error;
    }
  },

  async getNewsLastUpdate(): Promise<{ lastUpdate: string }> {
    try {
      // Если используем GitHub, читаем метаданные
      if (GITHUB_DATA_URL) {
        const response = await fetch(`${GITHUB_DATA_URL}/metadata.json`);
        if (response.ok) {
          const data = await response.json();
          return { lastUpdate: data.lastUpdate || new Date().toISOString() };
        }
      }
      
      // Fallback на API сервер (только если не localhost)
      if (API_BASE_URL && !isLocalhost) {
        try {
          const response = await fetch(`${API_BASE_URL}/news/last-update`);
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch (apiError) {
          logger.warn('⚠️ API недоступен при получении времени обновления');
        }
      }
      
      // Возвращаем текущее время, если API недоступен
      return { lastUpdate: new Date().toISOString() };
    } catch (error) {
      logger.error('Ошибка при получении времени обновления:', error);
      return { lastUpdate: new Date().toISOString() };
    }
  },

  async getNewsById(id: number): Promise<News | null> {
    try {
      const news = await this.getNews();
      return news.find((n) => n.id === id) || null;
    } catch (error) {
      logger.error('Ошибка при получении новости:', error);
      return null;
    }
  },

  // Articles
  async getArticles(): Promise<Article[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockArticles;
  },

  async getArticleById(id: number): Promise<Article | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockArticles.find((a) => a.id === id) || null;
  },
};

