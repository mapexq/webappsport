import { Star } from 'lucide-react';
import type { Bookmaker } from './BonusesTab';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookmakerCardProps {
  bookmaker: Bookmaker;
}

// Функция для открытия ссылки (в Capacitor приложении откроется в том же WebView)
const openBookmakerUrl = (url: string) => {
  // В Capacitor приложении window.location.href откроет ссылку в том же WebView
  window.location.href = url;
};

export function BookmakerCard({ bookmaker }: BookmakerCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-400/30 transition-all">
      {/* Logo & Name & Rating */}
      <div className="flex items-center gap-3 mb-6">
        {bookmaker.logoImage ? (
          <div className="flex items-center justify-center size-16 rounded-xl overflow-hidden">
            <ImageWithFallback src={bookmaker.logoImage} alt={bookmaker.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex items-center justify-center size-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl text-lg text-zinc-900 font-bold text-[24px]">
            {bookmaker.logo}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white mb-1 font-bold text-[20px]">{bookmaker.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-green-400 text-green-400" />
            <span className="text-sm text-green-400 font-bold">{bookmaker.rating}</span>
          </div>
        </div>
      </div>

      {/* Bonus */}
      <div className="mb-6 p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
        <p className="text-sm text-green-400 font-bold text-[18px]">{bookmaker.bonus}</p>
      </div>

      {/* Features */}
      <div className="mb-6 space-y-3">
        {bookmaker.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="size-1.5 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-[15px] font-bold">{feature}</span>
          </div>
        ))}
      </div>

      {/* Button */}
      <button 
        onClick={() => openBookmakerUrl(bookmaker.url)}
        className="w-full bg-green-400 hover:bg-green-500 text-zinc-900 text-sm h-12 rounded-lg transition-colors font-bold text-[18px]"
      >
        Получить бонус
      </button>
    </div>
  );
}