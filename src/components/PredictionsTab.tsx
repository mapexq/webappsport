import { PredictionCard } from './PredictionCard';
import { Badge } from './ui/badge';
import { TrendingUp, Target, Users, Filter, Trophy, Zap, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

export interface Prediction {
  id: number;
  eventName: string;
  discipline: string;
  tournament: string;
  expert: {
    name: string;
    avatar: string;
    status: 'amateur' | 'expert';
    winRate: number;
  };
  prediction: string;
  odds: number;
  comment: string;
  source: string;
  timestamp: string;
}

const predictions: Prediction[] = [
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
    comment: 'Оба клуба показывают отличную атакующую игру. В последних 5 личных встречах обе команды забивали в 4 матчах. Манчестер Сити дома всегда играет открыто, а Ливерпуль не привык обороняться.',
    source: 'Sports Analytics Pro',
    timestamp: '2 часа назад',
  },
  {
    id: 2,
    eventName: 'Лос-Анджелес Лейкерс - Бостон Селтикс',
    discipline: 'Баскетбол',
    tournament: 'NBA',
    expert: {
      name: 'Анна Смирнова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      status: 'expert',
      winRate: 68,
    },
    prediction: 'Тотал больше 225.5',
    odds: 1.92,
    comment: 'Лейкерс набирают в среднем 118 очков за игру, Селтикс - 121. Обе команды в топ-5 по результативности лиги. Последние 3 очных матча завершались с тоталом выше 230 очков.',
    source: 'NBA Expert',
    timestamp: '4 часа назад',
  },
  {
    id: 3,
    eventName: 'Реал Мадрид - Барселона',
    discipline: 'Футбол',
    tournament: 'Ла Лига',
    expert: {
      name: 'Сергей Петров',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      status: 'amateur',
      winRate: 61,
    },
    prediction: 'Победа Барселоны',
    odds: 2.45,
    comment: 'Барселона в отличной форме - 8 побед подряд в чемпионате. Реал играет без нескольких ключевых защитников. Каталонцы мотивированы на победу в Эль Класико.',
    source: 'Football Insider',
    timestamp: '6 часов назад',
  },
  {
    id: 4,
    eventName: 'Team Liquid - Natus Vincere',
    discipline: 'Киберспорт',
    tournament: 'CS2 Major',
    expert: {
      name: 'Александр "Esport King"',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
      status: 'expert',
      winRate: 71,
    },
    prediction: 'Победа Team Liquid с форой +1.5',
    odds: 1.75,
    comment: 'Liquid показали хорошую игру в группе. На последнем турнире они уже обыгрывали NaVi 2:1. Форма s1mple вызывает вопросы после травмы запястья.',
    source: 'Cyber Bet Tips',
    timestamp: '1 час назад',
  },
  {
    id: 5,
    eventName: 'Тампа-Бэй Лайтнинг - Торонто Мейпл Лифс',
    discipline: 'Хоккей',
    tournament: 'NHL',
    expert: {
      name: 'Михаил Зубов',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      status: 'expert',
      winRate: 69,
    },
    prediction: 'Индивидуальный тотал Торонто больше 3.5',
    odds: 2.10,
    comment: 'Торонто - лучшая атакующая команда сезона с 3.8 гола за игру. Тампа пропускает много в родных стенах. Мэттьюс и Марнер в ударе.',
    source: 'Hockey Analytics',
    timestamp: '3 часа назад',
  },
];

export function PredictionsTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPredictions = async () => {
    setIsRefreshing(true);
    
    // Имитация загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
    
    // Показываем toast об успешном обновлении
    toast.success('Прогнозы обновлены', {
      description: 'Получены последние данные от экспертов',
      duration: 3000,
    });
  };
  
  const expertPredictions = predictions.filter(p => p.expert.status === 'expert');
  const avgWinRate = Math.round(predictions.reduce((sum, p) => sum + p.expert.winRate, 0) / predictions.length);
  const maxOdds = Math.max(...predictions.map(p => p.odds));
  
  // Filter predictions based on selected filter
  const filteredPredictions = selectedFilter === 'all' 
    ? predictions 
    : predictions.filter(p => p.discipline.toLowerCase() === selectedFilter);
  
  const featuredPrediction = filteredPredictions[0];
  const otherPredictions = filteredPredictions.slice(1);
  
  const MAX_LENGTH = 130;
  const shouldTruncateFeatured = featuredPrediction.comment.length > MAX_LENGTH;
  const displayedFeaturedComment = shouldTruncateFeatured && !isFeaturedExpanded 
    ? featuredPrediction.comment.slice(0, MAX_LENGTH) + '...' 
    : featuredPrediction.comment;

  const disciplines = Array.from(new Set(predictions.map(p => p.discipline)));
  const filters = [
    { id: 'all', label: 'Все прогнозы', count: predictions.length },
    ...disciplines.map(disc => ({
      id: disc.toLowerCase(),
      label: disc,
      count: predictions.filter(p => p.discipline === disc).length
    }))
  ];

  return (
    <div className="space-y-8 px-4">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-400/20 flex items-center justify-center">
              <Trophy className="size-6 text-green-400" />
            </div>
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

      {/* Featured Prediction */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white font-bold text-[24px]">
            <Trophy className="size-5 text-green-400" />
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
                <span className="text-zinc-600">•</span>
                <span className="text-sm text-zinc-500 font-bold text-[14px]">{featuredPrediction.tournament}</span>
              </div>
              <h3 className="text-lg text-white font-bold text-[20px]">{featuredPrediction.eventName}</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl text-green-400 font-bold">{featuredPrediction.odds}</div>
              <div className="text-xs text-zinc-500 font-bold">коэфф.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <img
              src={featuredPrediction.expert.avatar}
              alt={featuredPrediction.expert.name}
              className="size-12 rounded-full object-cover"
            />
            <div>
              <div className="text-base text-white mb-1 font-bold text-[16px]">{featuredPrediction.expert.name}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500 font-bold text-[14px]">Эксперт</span>
                <span className="text-zinc-600 font-bold">•</span>
                <span className="text-green-400 font-bold text-[15px]">{featuredPrediction.expert.winRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
            <div className="text-xs text-zinc-500 mb-2 font-bold text-[14px]">Прогноз</div>
            <div className="text-base text-green-400 font-bold">{featuredPrediction.prediction}</div>
          </div>

          <div className="mb-6">
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

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-bold text-[14px]">{featuredPrediction.timestamp}</span>
            <span className="font-bold text-[14px]">{featuredPrediction.source}</span>
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-8" />
      </div>

      {/* Other Predictions */}
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
    </div>
  );
}