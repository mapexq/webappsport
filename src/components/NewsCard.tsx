import { Clock, ExternalLink, Newspaper } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { NewsItem } from './NewsTab';
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
import { useState } from 'react';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  const handleConfirm = () => {
    window.open(news.url, '_blank');
    setShowDialog(false);
  };

  return (
    <>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={news.cover}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
          <Badge className="absolute top-3 right-3 bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
            {news.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg text-white mb-4 line-clamp-2 group-hover:text-green-400 transition-colors font-bold text-[20px]">
            {news.title}
          </h3>

          <p className="text-sm text-zinc-400 mb-6 line-clamp-3 font-bold text-[16px]">
            {news.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Newspaper className="size-3" />
                <span className="font-bold text-[14px]">{news.source}</span>
              </div>
              <span className="font-bold text-[14px]">•</span>
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span className="font-bold text-[14px]">{news.timestamp}</span>
              </div>
            </div>
            <button
              className="px-6 h-10 bg-green-400 text-zinc-900 text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 font-bold text-[16px]"
              onClick={handleReadClick}
            >
              Читать
              <ExternalLink className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Переход к источнику</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Вы будете перенаправлены на внешний сайт: <span className="text-green-400">{news.source}</span>
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
    </>
  );
}