import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Filter } from 'lucide-react';
// Импорты UI компонентов - нужно создать или скопировать из src/components/ui
// Временно используем простые компоненты
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

const Badge = ({ children, className, ...props }: any) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className || ''}`} {...props}>
    {children}
  </span>
);

const Skeleton = ({ className, ...props }: any) => (
  <div className={`bg-zinc-800 animate-pulse rounded ${className || ''}`} {...props} />
);
import { toast } from 'sonner';

const API_URL = 'http://localhost:3001/api';

interface Forecast {
  id: string;
  eventName: string;
  sport: string;
  tournament: string | null;
  match: string | null;
  expertName: string;
  expertAvatarUrl: string | null;
  expertLevel: string | null;
  expertStatus: string | null;
  odds: number | null;
  pick: string;
  prediction: string | null;
  winrate: number | null;
  comment: string | null;
  fullText: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchForecasts(): Promise<Forecast[]> {
  const response = await fetch(`${API_URL}/forecasts`);
  if (!response.ok) {
    throw new Error('Ошибка загрузки прогнозов');
  }
  const data = await response.json();
  return data.data || [];
}

async function refreshForecasts(): Promise<{ success: boolean; count: number }> {
  const response = await fetch(`${API_URL}/forecasts/refresh`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Ошибка обновления прогнозов');
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
  
  if (diffMins < 60) {
    return `${diffMins} мин. назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  } else if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  } else {
    return date.toLocaleDateString('ru-RU');
  }
}

function ForecastCard({ forecast }: { forecast: Forecast }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 130;
  const comment = forecast.comment || forecast.fullText || '';
  const shouldTruncate = comment.length > MAX_LENGTH;
  const displayedComment = shouldTruncate && !isExpanded 
    ? comment.slice(0, MAX_LENGTH) + '...' 
    : comment;
  
  const isExpert = forecast.expertStatus === 'эксперт';
  const winrate = forecast.winrate || 0;
  const odds = forecast.odds || 0;
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-400/30 transition-all">
      {/* Header with discipline and odds */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
              {forecast.sport}
            </Badge>
            {forecast.tournament && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-sm text-zinc-500 font-bold">{forecast.tournament}</span>
              </>
            )}
          </div>
          <h3 className="text-lg text-white font-bold text-[20px]">
            {forecast.match || forecast.eventName}
          </h3>
        </div>
        {odds > 0 && (
          <div className="text-right">
            <div className="text-3xl text-green-400 font-bold">{odds.toFixed(2)}</div>
            <div className="text-xs text-zinc-500 font-bold">коэфф.</div>
          </div>
        )}
      </div>

      {/* Expert Profile */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <img
          src={forecast.expertAvatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
          alt={forecast.expertName}
          className="size-12 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
          }}
        />
        <div>
          <div className="text-base text-white mb-1 font-bold">{forecast.expertName}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 font-bold">
              {isExpert ? 'Эксперт' : 'Любитель'}
            </span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-green-400 font-bold">
              {winrate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
        <div className="text-xs text-zinc-500 mb-2 font-bold">Прогноз</div>
        <div className="text-base text-green-400 font-bold">
          {forecast.prediction || forecast.pick}
        </div>
      </div>

      {/* Comment */}
      {comment && (
        <div className="mb-6">
          <p className="text-zinc-400 leading-relaxed font-bold text-[15px]">
            {displayedComment}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-green-400 text-sm font-bold flex items-center gap-1 hover:text-green-300 transition-colors"
            >
              {isExpanded ? 'Свернуть' : 'Ещё'}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="font-bold text-[14px]">{formatDate(forecast.publishedAt)}</span>
        {forecast.sourceUrl && (
          <a
            href={forecast.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[14px] hover:text-green-400 transition-colors"
          >
            Источник
          </a>
        )}
      </div>
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-12 w-20" />
      </div>
      <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 rounded-lg">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mb-6" />
      <Skeleton className="h-24 w-full mb-6" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export default function ForecastsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Проверяем, нужно ли автообновление
  useEffect(() => {
    const lastUpdate = localStorage.getItem('forecasts_last_update');
    if (lastUpdate) {
      const lastUpdateTime = new Date(lastUpdate).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastUpdateTime) / 60000;
      
      if (diffMinutes > 30) {
        // Автообновление если прошло больше 30 минут
        refreshMutation.mutate();
      }
    }
  }, []);

  const { data: forecasts = [], isLoading, error } = useQuery({
    queryKey: ['forecasts'],
    queryFn: fetchForecasts,
    staleTime: 30 * 60 * 1000, // 30 минут
  });

  const refreshMutation = useMutation({
    mutationFn: refreshForecasts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      localStorage.setItem('forecasts_last_update', new Date().toISOString());
      toast.success('Прогнозы обновлены', {
        description: `Получено ${data.count} свежих прогнозов`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Ошибка обновления', {
        description: 'Попробуйте позже',
        duration: 3000,
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const filteredForecasts = selectedFilter === 'all'
    ? forecasts
    : forecasts.filter(f => f.sport.toLowerCase() === selectedFilter.toLowerCase());

  const sports = Array.from(new Set(forecasts.map(f => f.sport)));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Прогнозы</h1>
          <p className="text-zinc-400">Актуальные прогнозы от экспертов</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <RefreshCw className={`size-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
          className={selectedFilter === 'all' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          Все
        </Button>
        {sports.map((sport) => (
          <Button
            key={sport}
            variant={selectedFilter === sport.toLowerCase() ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(sport.toLowerCase())}
            className={selectedFilter === sport.toLowerCase() ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {sport}
          </Button>
        ))}
      </div>

      {/* Forecasts List */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">Ошибка загрузки прогнозов. Попробуйте обновить страницу.</p>
        </div>
      )}

      {isLoading || refreshMutation.isPending ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForecastSkeleton key={i} />
          ))}
        </div>
      ) : filteredForecasts.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-400 text-lg">Прогнозы не найдены</p>
          <Button
            onClick={handleRefresh}
            className="mt-4 bg-green-500 hover:bg-green-600"
          >
            Загрузить прогнозы
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredForecasts.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </div>
      )}
    </div>
  );
}
