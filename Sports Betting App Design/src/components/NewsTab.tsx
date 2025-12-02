import { NewsCard } from './NewsCard';
import { Badge } from './ui/badge';
import { Newspaper, Clock, TrendingUp, Filter, Flame, ExternalLink, Radio, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
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

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  cover: string;
  source: string;
  category: string;
  timestamp: string;
  url: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'Манчестер Сити объявил о трансфере бразильского форварда',
    description: 'Английский клуб подписал контракт с 22-летним нападающим на 5 лет. Сумма трансфера составила рекордные 85 миллионов евро.',
    cover: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=500&fit=crop',
    source: 'Sports Daily',
    category: 'Футбол',
    timestamp: '30 минут назад',
    url: '#',
  },
  {
    id: 2,
    title: 'Леброн Джеймс установил новый рекорд НБА',
    description: 'Звезда Лейкерс стал первым игроком в истории лиги, набравшим 40 000 очков в регулярных чемпионатах.',
    cover: 'https://images.unsplash.com/photo-1616353352910-15d970ac020b?w=800&h=500&fit=crop',
    source: 'NBA News',
    category: 'Баскетбол',
    timestamp: '1 час назад',
    url: '#',
  },
  {
    id: 3,
    title: 'Российские теннисисты триумфально выступили на турнире',
    description: 'Даниил Медведев и Андрей Рублёв вышли в полуфинал престижного турнира серии Masters 1000.',
    cover: 'https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=800&h=500&fit=crop',
    source: 'Tennis World',
    category: 'Теннис',
    timestamp: '2 часа назад',
    url: '#',
  },
  {
    id: 4,
    title: 'КХЛ представила календарь плей-офф',
    description: 'Лига объявила расписание матчей первого раунда Кубка Гагарина. Начало серий запланировано на следующую неделю.',
    cover: 'https://images.unsplash.com/photo-1644553054315-9fb69509f932?w=800&h=500&fit=crop',
    source: 'Hockey Russia',
    category: 'Хоккей',
    timestamp: '3 часа назад',
    url: '#',
  },
  {
    id: 5,
    title: 'Team Spirit выиграли международный турнир по Dota 2',
    description: 'Российская команда одержала победу на престижном турнире с призовым фондом 500 000 долларов.',
    cover: 'https://images.unsplash.com/photo-1635372708431-64774de60e20?w=800&h=500&fit=crop',
    source: 'Esports Insider',
    category: 'Киберспорт',
    timestamp: '4 часа назад',
    url: '#',
  },
  {
    id: 6,
    title: 'Барселона продлила контракт с главным тренером',
    description: 'Каталонский клуб и наставник команды подписали новое соглашение до 2027 года с увеличенной зарплатой.',
    cover: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=500&fit=crop',
    source: 'La Liga News',
    category: 'Футбол',
    timestamp: '5 часов назад',
    url: '#',
  },
];

export function NewsTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    
    // Имитация загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
    
    // Показываем toast об успешном обновлении
    toast.success('Новости обновлены', {
      description: 'Получены последние материалы',
      duration: 3000,
    });
  };
  
  // Filter news based on selected filter
  const filteredNews = selectedFilter === 'all' 
    ? newsItems 
    : newsItems.filter(n => n.category.toLowerCase() === selectedFilter);
  
  const recentNews = filteredNews.filter((_, index) => index < 3);
  const latestNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  const categories = Array.from(new Set(newsItems.map(n => n.category)));
  const filters = [
    { id: 'all', label: 'Все новости', count: newsItems.length },
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
            onClick={handleRefreshNews}
            disabled={isRefreshing}
            className="size-10 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center hover:bg-green-400/20 transition-all disabled:opacity-50 font-bold font-normal text-[16px]"
          >
            <RefreshCw className={`size-5 text-green-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Large Hero Card - same format as other news */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer">
          {/* Cover Image */}
          <div className="relative h-64 overflow-hidden">
            <ImageWithFallback
              src={latestNews.cover}
              alt={latestNews.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              <button className="px-6 h-10 bg-green-400 text-zinc-900 text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 font-bold text-[16px]" onClick={() => handleReadClick(latestNews)}>
                Читать
                <ExternalLink className="size-4" />
              </button>
            </div>
          </div>
        </div>

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
        
        <div className="grid gap-4 md:grid-cols-2">
          {otherNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
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