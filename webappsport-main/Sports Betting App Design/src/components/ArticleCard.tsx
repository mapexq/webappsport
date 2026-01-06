import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Article } from './ArticlesTab';

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-green-400/30 transition-all group cursor-pointer flex flex-col"
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={article.cover}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
            {article.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg text-white mb-4 line-clamp-2 group-hover:text-green-400 transition-colors font-bold text-[20px]">
          {article.title}
        </h3>

        <p className="text-sm text-zinc-400 mb-6 line-clamp-3 flex-1 font-bold text-[16px]">
          {article.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="size-3" />
            <span className="font-bold text-[14px]">{article.readTime} мин</span>
          </div>
          <button className="px-6 h-10 bg-green-400 text-zinc-900 text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2 text-[16px] font-bold">
            Читать
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}