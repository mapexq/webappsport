import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Newspaper, Clock, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

// Временные UI компоненты (как в ForecastsPage)
const Button = ({ children, onClick, disabled, className, variant, size, ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);

const Badge = ({ children, className, variant, onClick, ...props }: any) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer ${className || ''}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </span>
);

const Skeleton = ({ className, ...props }: any) => (
  <div className={`bg-zinc-800 animate-pulse rounded ${className || ''}`} {...props} />
);

// Простой AlertDialog
const AlertDialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({ children }: any) => <div>{children}</div>;
const AlertDialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const AlertDialogTitle = ({ children }: any) => <h3 className="text-lg font-semibold text-white mb-2">{children}</h3>;
const AlertDialogDescription = ({ children }: any) => <p className="text-sm text-zinc-400">{children}</p>;
const AlertDialogFooter = ({ children }: any) => <div className="flex justify-end gap-2 mt-4">{children}</div>;
const AlertDialogCancel = ({ children, onClick }: any) => (
  <Button variant="outline" onClick={onClick} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
    {children}
  </Button>
);
const AlertDialogAction = ({ children, onClick }: any) => (
  <Button onClick={onClick} className="bg-green-400 text-zinc-900 hover:bg-green-500">
    {children}
  </Button>
);

// Простой ImageWithFallback
const ImageWithFallback = ({ src, alt, className, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/images/news-placeholder.jpg');
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

const API_URL = 'http://localhost:3001/api';

interface News {
  id: string;
  title: string;
  sport: string | null;
  category: string | null;
  imageUrl: string | null;
  teaser: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchNews(): Promise<News[]> {
  const response = await fetch(`${API_URL}/news`);
  if (!response.ok) {
    throw new Error('Ошибка загрузки новостей');
  }
  const data = await response.json();
  return data.data || [];
}

async function fetchLastUpdate(): Promise<string | null> {
  const response = await fetch(`${API_URL}/news/last-update`);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.lastUpdate;
}

async function refreshNews(): Promise<{ success: boolean; count: number; news: News[] }> {
  const response = await fetch(`${API_URL}/news/refresh`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Ошибка обновления новостей');
  }
  const data = await response.json();
  return data;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Недавно';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NewsSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

function CompactNewsSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex gap-4 p-4">
      <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const queryClient = useQueryClient();

  // Проверяем, нужно ли автообновление при монтировании
  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        const lastUpdate = await fetchLastUpdate();
        if (lastUpdate) {
          const lastUpdateTime = new Date(lastUpdate).getTime();
          const now = new Date().getTime();
          const diffMinutes = (now - lastUpdateTime) / 60000;
          
          if (diffMinutes > 30) {
            // Автообновление если прошло больше 30 минут
            refreshMutation.mutate();
          }
        } else {
          // Если нет данных о последнем обновлении, загружаем новости
          queryClient.invalidateQueries({ queryKey: ['news'] });
        }
      } catch (error) {
        console.error('Ошибка проверки последнего обновления:', error);
      }
    };

    checkAndRefresh();
  }, []);

  const { data: news = [], isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 30 * 60 * 1000, // 30 минут
  });

  const refreshMutation = useMutation({
    mutationFn: refreshNews,
    onSuccess: (data) => {
      queryClient.setQueryData(['news'], data.news);
      toast.success('Новости обновлены', {
        description: `Получено ${data.count} свежих новостей`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Ошибка обновления', {
        description: 'Не удалось обновить новости, попробуйте позже',
        duration: 3000,
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleReadClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (selectedNews?.sourceUrl) {
      window.open(selectedNews.sourceUrl, '_blank');
    }
    setShowDialog(false);
  };

  // Фильтруем новости по выбранной категории
  const filteredNews = selectedFilter === 'all'
    ? news
    : news.filter(n => {
        const sport = (n.sport || '').toLowerCase();
        const category = (n.category || '').toLowerCase();
        const filter = selectedFilter.toLowerCase();
        return sport === filter || category === filter;
      });

  // Получаем уникальные категории/спорты
  const categories = Array.from(
    new Set(
      news
        .map(n => n.sport || n.category)
        .filter((cat): cat is string => cat !== null)
    )
  );

  const filters = [
    { id: 'all', label: 'Все', count: news.length },
    ...categories.map(cat => ({
      id: cat.toLowerCase(),
      label: cat,
      count: news.filter(n => (n.sport || n.category) === cat).length,
    })),
  ];

  const latestNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p>Ошибка загрузки новостей</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['news'] })} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Hero Welcome Section */}
        <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-green-400/20 flex items-center justify-center">
                  <Newspaper className="size-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl text-white text-[24px] font-bold">Спортивные новости</h2>
                  <p className="text-sm text-zinc-400 text-[15px] font-bold">Актуальные события из мира спорта и беттинга</p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                className="bg-green-400/20 hover:bg-green-400/30 text-green-400 border border-green-400/30"
              >
                <RefreshCw className={`size-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
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

        {/* Latest News Hero Card */}
        {isLoading ? (
          <NewsSkeleton />
        ) : latestNews ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer"
               onClick={() => handleReadClick(latestNews)}>
            <div className="relative h-64 overflow-hidden">
              <ImageWithFallback
                src={latestNews.imageUrl || '/images/news-placeholder.jpg'}
                alt={latestNews.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
              {latestNews.sport && (
                <Badge className="absolute top-3 right-3 bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
                  {latestNews.sport}
                </Badge>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                {latestNews.title}
              </h3>
              {latestNews.teaser && (
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                  {latestNews.teaser}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(latestNews.publishedAt)}
                  </div>
                  {latestNews.sourceName && (
                    <span>{latestNews.sourceName}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="bg-green-400/20 hover:bg-green-400/30 text-green-400 border border-green-400/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadClick(latestNews);
                  }}
                >
                  Читать
                  <ExternalLink className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-zinc-400 py-12">
            <p>Новостей пока нет</p>
          </div>
        )}

        {/* Other News List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <CompactNewsSkeleton key={i} />
            ))}
          </div>
        ) : otherNews.length > 0 ? (
          <div className="space-y-4">
            {otherNews.map((newsItem) => (
              <div
                key={newsItem.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer flex gap-4 p-4"
                onClick={() => handleReadClick(newsItem)}
              >
                <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={newsItem.imageUrl || '/images/news-placeholder.jpg'}
                    alt={newsItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-green-400 transition-colors line-clamp-2">
                      {newsItem.title}
                    </h3>
                  </div>
                  {newsItem.teaser && (
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                      {newsItem.teaser}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {newsItem.sport && (
                        <Badge variant="outline" className="h-6 px-2 text-xs bg-zinc-800/50 border-zinc-700">
                          {newsItem.sport}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(newsItem.publishedAt)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-400/20 hover:bg-green-400/30 text-green-400 border border-green-400/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadClick(newsItem);
                      }}
                    >
                      Читать
                      <ExternalLink className="size-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 && !isLoading ? (
          <div className="text-center text-zinc-400 py-12">
            <p>Новостей в этой категории нет</p>
          </div>
        ) : null}

        {/* Alert Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Открыть новость?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы будете перенаправлены на внешний сайт для чтения полной версии новости.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDialog(false)}>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Открыть
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
