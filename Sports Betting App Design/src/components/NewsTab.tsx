import { NewsCard } from './NewsCard';
import { Badge } from './ui/badge';
import { Newspaper, Clock, Filter, Flame, ExternalLink, Radio, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { apiService } from '../services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Skeleton } from './ui/skeleton';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  cover: string;
  source: string;
  category: string;
  timestamp: string;
  url: string;
}

// Преобразует данные из API в формат NewsItem
function transformNewsItem(apiNews: any): NewsItem {
  // Форматируем время для отображения - показываем реальное время публикации
  const formatTimestamp = (publishedAt: string) => {
    try {
      const date = new Date(publishedAt);
      const now = new Date();
      
      // Если дата сегодня - показываем только время
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      }
      
      // Если дата вчера - показываем "Вчера, HH:MM"
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Если дата в пределах недели - показываем день недели и время
      const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
      if (diffDays < 7) {
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        return `${dayName}, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Для более старых новостей - показываем дату и время
      return date.toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Недавно';
    }
  };

  // Убеждаемся, что изображение правильно извлекается
  const imageUrl = apiNews.imageUrl || apiNews.image || apiNews.cover || '/images/news-placeholder.jpg';
  
  // Если изображение - относительный путь, делаем его абсолютным
  const normalizedImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : imageUrl.startsWith('/') 
      ? `https://sportrbc.ru${imageUrl}` 
      : imageUrl;

  return {
    id: apiNews.id || String(Math.random()),
    title: apiNews.title || '',
    description: apiNews.teaser || apiNews.title || '',
    cover: normalizedImageUrl,
    source: apiNews.sourceName || 'РБК Спорт',
    category: apiNews.sport || apiNews.category || 'Другое',
    timestamp: formatTimestamp(apiNews.publishedAt || new Date().toISOString()),
    url: apiNews.sourceUrl || '#',
  };
}

export function NewsTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  // Загрузка новостей
  const loadNews = async () => {
    try {
      setIsLoading(true);
      const news = await apiService.getNews();
      const transformedNews = news.map(transformNewsItem);
      setNewsItems(transformedNews);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      toast.error('Не удалось загрузить новости', {
        description: 'Попробуйте обновить страницу позже',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Просто загружаем новости при монтировании (обновление происходит в Layout)

  // Обновление новостей
  const handleRefreshNews = async (silent = false) => {
    setIsRefreshing(true);
    
    try {
      const result = await apiService.refreshNews();
      
      if (result.success) {
        // Если новости не изменились (updated: false), не обновляем UI
        if (result.updated === false) {
          console.log('Новости не изменились, UI не обновляется');
          if (!silent) {
            toast.info('Новости актуальны', {
              description: 'Новых материалов нет',
              duration: 2000,
            });
          }
          return;
        }
        
        const transformedNews = result.news.map(transformNewsItem);
        setNewsItems(transformedNews);
        
        if (!silent) {
          toast.success('Новости обновлены', {
            description: `Получено ${result.count} материалов`,
            duration: 3000,
          });
        }
      } else {
        // Если парсинг не удался, но есть старые данные
        if (result.news && result.news.length > 0) {
          const transformedNews = result.news.map(transformNewsItem);
          setNewsItems(transformedNews);
        }
        
        if (!silent) {
          toast.error('Не удалось обновить новости', {
            description: result.message || 'Попробуйте позже',
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      console.error('Ошибка обновления новостей:', error);
      
      if (!silent) {
        toast.error('Не удалось обновить новости', {
          description: 'Попробуйте позже',
          duration: 5000,
        });
      }
      
      // Пытаемся загрузить старые данные
      await loadNews();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadNews();
  }, []);

  // Filter news based on selected filter
  const filteredNews = selectedFilter === 'all' 
    ? newsItems 
    : newsItems.filter(n => n.category.toLowerCase() === selectedFilter.toLowerCase());
  
  const latestNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  const categories = Array.from(new Set(newsItems.map(n => n.category)));
  const filters = [
    { id: 'all', label: 'Все', count: newsItems.length },
    ...categories.map(cat => ({
      id: cat.toLowerCase(),
      label: cat,
      count: newsItems.filter(n => n.category === cat).length
    }))
  ];

  const handleReadClick = (news: NewsItem) => {
    setSelectedNews(news);
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (selectedNews) {
      window.open(selectedNews.url, '_blank');
    }
    setShowDialog(false);
  };

  // Skeleton loader
  const NewsSkeleton = () => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <Skeleton className="h-48 w-full bg-zinc-800" />
      <div className="p-6">
        <Skeleton className="h-6 w-full mb-4 bg-zinc-800" />
        <Skeleton className="h-4 w-3/4 mb-4 bg-zinc-800" />
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <Skeleton className="h-4 w-32 bg-zinc-800" />
          <Skeleton className="h-10 w-24 bg-zinc-800" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-4">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-400/20 flex items-center justify-center">
              <Newspaper className="size-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl text-white text-[24px] font-bold">Спортивные новости</h2>
              <p className="text-sm text-zinc-400 text-[15px] font-bold">Актуальные события из мира спорта и беттинга</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-4 text-zinc-500" />
          <span className="text-sm text-zinc-400 font-bold text-[14px]">Категории</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              className={`cursor-pointer transition-all h-10 px-4 text-sm ${
                selectedFilter === filter.id
                  ? 'bg-green-400 text-zinc-900 border-green-400'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Breaking News Hero Card */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white text-[24px] font-bold">
            <Flame className="size-5 text-orange-400" />
            Главная новость
          </h3>
          <button
            onClick={() => handleRefreshNews(false)}
            disabled={isRefreshing || isLoading}
            className="size-10 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center hover:bg-green-400/20 transition-all disabled:opacity-50 font-bold font-normal text-[16px]"
          >
            <RefreshCw className={`size-5 text-green-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {isLoading ? (
          <NewsSkeleton />
        ) : latestNews ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer">
            {/* Cover Image */}
            <div className="relative h-64 overflow-hidden bg-zinc-800">
              <ImageWithFallback
                src={latestNews.cover}
                alt={latestNews.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
              <Badge className="absolute top-3 right-3 bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
                {latestNews.category}
              </Badge>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg text-white mb-4 group-hover:text-green-400 transition-colors font-bold text-[20px]">
                {latestNews.title}
              </h3>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Newspaper className="size-3" />
                    <span className="font-bold text-[14px]">{latestNews.source}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span className="font-bold text-[14px]">{latestNews.timestamp}</span>
                  </div>
                </div>
                <button 
                  className="px-6 h-10 bg-green-400 text-zinc-900 text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 font-bold text-[16px]" 
                  onClick={() => handleReadClick(latestNews)}
                >
                  Читать
                  <ExternalLink className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400 text-lg">Новостей пока нет</p>
            <p className="text-zinc-500 text-sm mt-2">Нажмите кнопку обновления для загрузки новостей</p>
          </div>
        )}

        <div className="h-px bg-zinc-800 my-8" />
      </div>

      {/* Recent News Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white text-[24px] font-bold">
            <Radio className="size-5 text-green-400" />
            Последние новости
          </h3>
          <span className="text-sm text-zinc-500 font-bold">{otherNews.length} материалов</span>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <NewsSkeleton />
            <NewsSkeleton />
            <NewsSkeleton />
            <NewsSkeleton />
          </div>
        ) : otherNews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {otherNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400">Новостей пока нет</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Переход к источнику</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Вы будете перенаправлены на внешний сайт: <span className="text-green-400 font-bold">{selectedNews?.source}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-green-400 text-zinc-900 hover:bg-green-500"
            >
              Перейти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
