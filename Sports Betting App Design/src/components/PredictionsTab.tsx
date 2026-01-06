import { PredictionCard } from './PredictionCard';
import { Badge } from './ui/badge';
import { Filter, Trophy, Zap, ChevronDown, ChevronUp, RefreshCw, Rocket } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import { apiService } from '../services/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { logger } from '../utils/logger';

export interface Prediction {
  id: number;
  eventName: string;
  discipline: string;
  tournament: string;
  expert: {
    name: string;
    avatar: string;
    status: 'amateur' | 'expert' | 'capper';
    winRate: number;
  };
  prediction: string;
  odds: number;
  comment: string;
  source: string;
  timestamp: string;
  publishedAt?: string; // ISO строка даты публикации
}

// Прогнозы теперь загружаются через API

export function PredictionsTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем прогнозы при монтировании компонента
  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPredictions();
      setPredictions(data);
    } catch (error) {
      logger.error('Ошибка при загрузке прогнозов:', error);
      toast.error('Ошибка загрузки прогнозов', {
        description: 'Не удалось загрузить прогнозы. Используются данные по умолчанию.',
        duration: 3000,
      });
      // Используем моковые данные при ошибке
      setPredictions(predictions);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPredictions = async () => {
    setIsRefreshing(true);
    
    try {
      // Ждем 3 секунды для анимации загрузки
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const data = await apiService.refreshPredictions();
      setPredictions(data);
      
      toast.success(<span style={{ fontWeight: 'bold' }}>Прогнозы обновлены</span>, {
        description: <span style={{ fontWeight: 'bold' }}>Получены последние данные от экспертов</span>,
        duration: 3000,
      });
    } catch (error) {
      logger.error('Ошибка при обновлении прогнозов:', error);
      toast.error(<span style={{ fontWeight: 'bold' }}>Ошибка обновления</span>, {
        description: <span style={{ fontWeight: 'bold' }}>Не удалось обновить прогнозы</span>,
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ДО УСЛОВНЫХ ВОЗВРАТОВ!
  // Мемоизируем фильтры для предотвращения лишних перерендеров
  const filters = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return [{ id: 'all', label: 'Все прогнозы', count: 0 }];
    }
    const disciplines = Array.from(new Set(predictions.map(p => p.discipline).filter(Boolean)));
    return [
      { id: 'all', label: 'Все прогнозы', count: predictions.length },
      ...disciplines.map(disc => ({
        id: disc.toLowerCase(),
        label: disc,
        count: predictions.filter(p => p && p.discipline === disc).length
      }))
    ];
  }, [predictions]);

  // Filter predictions based on selected filter (мемоизировано для предотвращения лишних перерендеров)
  const filteredPredictions = useMemo(() => {
    if (!predictions || predictions.length === 0) return [];
    return selectedFilter === 'all' 
      ? predictions 
      : predictions.filter(p => p && p.discipline && p.discipline.toLowerCase() === selectedFilter);
  }, [selectedFilter, predictions]);
  
  // Первый прогноз = Прогноз дня, остальные 9 = Другие прогнозы (мемоизировано)
  const featuredPrediction = useMemo(() => {
    return filteredPredictions && filteredPredictions.length > 0 ? filteredPredictions[0] : null;
  }, [filteredPredictions]);
  const otherPredictions = useMemo(() => {
    return filteredPredictions && filteredPredictions.length > 1 ? filteredPredictions.slice(1, 10) : [];
  }, [filteredPredictions]);
  
  const MAX_LENGTH = 130;
  const shouldTruncateFeatured = featuredPrediction?.comment && featuredPrediction.comment.length > MAX_LENGTH;
  const displayedFeaturedComment = shouldTruncateFeatured && !isFeaturedExpanded && featuredPrediction
    ? featuredPrediction.comment.slice(0, MAX_LENGTH) + '...' 
    : featuredPrediction?.comment || '';

  const expertPredictions = predictions.filter(p => p.expert.status === 'expert');
  const avgWinRate = predictions.length > 0 
    ? Math.round(predictions.reduce((sum, p) => sum + p.expert.winRate, 0) / predictions.length)
    : 0;
  const maxOdds = predictions.length > 0 
    ? Math.max(...predictions.map(p => p.odds))
    : 0;
  
  if (loading) {
    return (
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-zinc-400">Загрузка прогнозов...</div>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-zinc-400">Прогнозы не найдены</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Trophy className="size-12 text-green-400" />
            <div>
              <h2 className="text-xl text-white text-[24px] font-bold">Прогнозы экспертов</h2>
              <p className="text-sm text-zinc-400 text-[15px] font-bold">Аналитика от профессионалов спортивного беттинга</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-4 text-zinc-500" />
          <span className="text-sm text-zinc-400 font-bold">Дисциплины</span>
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

      {/* Featured Prediction - Прогноз дня (первый прогноз с сайта) */}
      {featuredPrediction && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg text-white font-bold text-[24px]">
              <Rocket className="size-5 text-green-400" />
              Прогноз дня
            </h3>
            <button
              onClick={handleRefreshPredictions}
              disabled={isRefreshing}
              className="size-10 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center hover:bg-green-400/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`size-5 text-green-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Large Featured Card */}
          <div className="bg-gradient-to-br from-green-400/5 via-zinc-900/50 to-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs text-[14px]">
                    {featuredPrediction.discipline}
                  </Badge>
                </div>
                <h3 className="text-lg text-white font-bold text-[20px]">{featuredPrediction.eventName}</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl text-green-400 font-bold">{featuredPrediction.odds}</div>
                <div className="text-xs text-zinc-500 font-bold">коэфф.</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <ImageWithFallback
                src={featuredPrediction.expert.avatar}
                alt={featuredPrediction.expert.name}
                className="size-12 rounded-full object-cover"
              />
              <div>
                <div className="text-base text-white mb-1 font-bold text-[16px]">{featuredPrediction.expert.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-500 font-bold text-[14px]">
                    {featuredPrediction.expert.status === 'capper' ? 'Каппер' : 
                     featuredPrediction.expert.status === 'expert' ? 'Эксперт' : 'Любитель'}
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-green-400 font-bold text-[15px]">{featuredPrediction.expert.winRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
              <div className="text-xs text-zinc-500 mb-2 font-bold text-[14px]">Прогноз</div>
              <div className="text-base text-green-400 font-bold">{featuredPrediction.prediction}</div>
            </div>

            <div>
              <p className="text-zinc-400 leading-relaxed font-bold text-[14px]">
                {displayedFeaturedComment}
              </p>
              {shouldTruncateFeatured && (
                <button
                  onClick={() => setIsFeaturedExpanded(!isFeaturedExpanded)}
                  className="mt-2 text-green-400 text-sm font-bold flex items-center gap-1 hover:text-green-300 transition-colors"
                >
                  {isFeaturedExpanded ? (
                    <>
                      Свернуть
                      <ChevronUp className="size-4" />
                    </>
                  ) : (
                    <>
                      Ещё
                      <ChevronDown className="size-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-8" />
        </div>
      )}

      {/* Other Predictions - Остальные 9 прогнозов */}
      {otherPredictions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg text-white text-[24px] font-bold">
              <Zap className="size-5 text-green-400" />
              Другие прогнозы
            </h3>
            <span className="text-sm text-zinc-500 font-bold">{otherPredictions.length} активных</span>
          </div>
          
          <div className="space-y-4">
            {otherPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}