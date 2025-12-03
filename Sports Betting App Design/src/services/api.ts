// API Service layer for the Sports Betting App
// Currently using mock data, but structured for easy API integration

import type { Bookmaker, Prediction, News, Article } from '../types';

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
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || '';
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
const GITHUB_DATA_URL = GITHUB_REPO 
  ? `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data`
  : null;

// API base URL для локального сервера (fallback)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Service functions
export const apiService = {
  // Bookmakers
  async getBookmakers(): Promise<Bookmaker[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockBookmakers;
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
        const response = await fetch(`${GITHUB_DATA_URL}/predictions.json`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        // Если GitHub недоступен, пробуем API
      }
      
      // Fallback на API сервер
      const response = await fetch(`${API_BASE_URL}/predictions`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      throw new Error('Ошибка при получении прогнозов');
    } catch (error) {
      console.error('Ошибка при получении прогнозов:', error);
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
      
      // Fallback на API сервер
      const response = await fetch(`${API_BASE_URL}/predictions/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Ошибка при обновлении прогнозов');
      }
      const data = await response.json();
      return data.predictions || data;
    } catch (error) {
      console.error('Ошибка при обновлении прогнозов:', error);
      throw error;
    }
  },

  async getPredictionById(id: number): Promise<Prediction | null> {
    try {
      const predictions = await this.getPredictions();
      return predictions.find((p) => p.id === id) || null;
    } catch (error) {
      console.error('Ошибка при получении прогноза:', error);
      return null;
    }
  },

  // News - использует GitHub или backend API
  async getNews(): Promise<any[]> {
    try {
      // Приоритет: GitHub > API > Mock
      if (GITHUB_DATA_URL) {
        const response = await fetch(`${GITHUB_DATA_URL}/news.json`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        // Если GitHub недоступен, пробуем API
      }
      
      // Fallback на API сервер
      const response = await fetch(`${API_BASE_URL}/news`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      throw new Error('Ошибка при получении новостей');
    } catch (error) {
      console.error('Ошибка при получении новостей:', error);
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
      
      // Fallback на API сервер
      const response = await fetch(`${API_BASE_URL}/news/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Ошибка при обновлении новостей');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при обновлении новостей:', error);
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
      
      // Fallback на API сервер
      const response = await fetch(`${API_BASE_URL}/news/last-update`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      throw new Error('Ошибка при получении времени обновления');
    } catch (error) {
      console.error('Ошибка при получении времени обновления:', error);
      return { lastUpdate: new Date().toISOString() };
    }
  },

  async getNewsById(id: number): Promise<News | null> {
    try {
      const news = await this.getNews();
      return news.find((n) => n.id === id) || null;
    } catch (error) {
      console.error('Ошибка при получении новости:', error);
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

