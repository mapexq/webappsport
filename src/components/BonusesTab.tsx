import { BookmakerCard } from './BookmakerCard';
import { TrendingUp, Star, Gift, Award } from 'lucide-react';
import pariLogo from 'figma:asset/eadd68338a1836c8882d99a00020ab22178df278.png';
import winlineLogo from 'figma:asset/cd63b9d71bf80f99da220730e2da2673c51aca65.png';
import betboomLogo from 'figma:asset/ff03a49e58d99ea263b44492a657d8f8a102fd37.png';
import leonLogo from 'figma:asset/876f925dde3fe8d16f1d2ea7730ecf71984ed308.png';
import marathonbetLogo from 'figma:asset/3b56f5d213635bf6ff3ccb28b441710973364831.png';
import melbetLogo from 'figma:asset/ffc9d3aade4326b0c8a2229ba78f563086f8b1d3.png';
import fonbetLogo from 'figma:asset/3bc1eb74c46ec574d7315a990f6fceb4adc3890f.png';
import betcityLogo from 'figma:asset/d5f6e2a54d59fbdf604fa5f548a11e632a42d3bb.png';
import olimpbetLogo from 'figma:asset/5a58907bd1c0a85a50111916d1b41e528bd68503.png';
import baltbetLogo from 'figma:asset/2872bb2c2135d0987d3464fff4b02318446ae333.png';

export interface Bookmaker {
  id: number;
  name: string;
  logo: string;
  logoImage?: string;
  rating: number;
  bonus: string;
  bonusAmount: number;
  features: string[];
  license: string;
}

const bookmakers: Bookmaker[] = [
  {
    id: 1,
    name: 'PARI',
    logo: 'PR',
    logoImage: pariLogo,
    rating: 4.8,
    bonus: 'До 5 000 ₽ Фрибет',
    bonusAmount: 5000,
    features: ['Быстрая регистрация', 'Программа лояльности', 'Киберспорт линии'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 2,
    name: 'Fonbet',
    logo: 'FB',
    logoImage: fonbetLogo,
    rating: 4.7,
    bonus: 'До 15 000 ₽ Фрибет',
    bonusAmount: 15000,
    features: ['Моментальные выплаты', 'Высокие коэффициенты', 'Широкая линия событий'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 3,
    name: 'Winline',
    logo: 'WL',
    logoImage: winlineLogo,
    rating: 4.6,
    bonus: '3 000 ₽ Фрибет',
    bonusAmount: 3000,
    features: ['Быстрая верификация', 'Cashback программа', 'Live ставки'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 4,
    name: 'BetBoom',
    logo: 'BB',
    logoImage: betboomLogo,
    rating: 4.7,
    bonus: 'До 10 000 ₽ Фрибет',
    bonusAmount: 10000,
    features: ['Быстрые выплаты', 'Щедрые бонусы', 'Статистика и аналитика'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 5,
    name: 'Betcity',
    logo: 'BC',
    logoImage: betcityLogo,
    rating: 4.5,
    bonus: 'До 2 000 ₽ Фрибет',
    bonusAmount: 2000,
    features: ['Более 20 лет на рынке', 'Множество акций', 'Круглосуточная поддержка'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 6,
    name: 'Leon',
    logo: 'LN',
    logoImage: leonLogo,
    rating: 4.4,
    bonus: 'До 25 000 ₽ Фрибет',
    bonusAmount: 25000,
    features: ['Простая регистрация', 'Хорошие коэффициенты', 'Кэшаут live-ставок'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 7,
    name: 'Marathonbet',
    logo: 'MB',
    logoImage: marathonbetLogo,
    rating: 4.6,
    bonus: 'До 25 000 ₽ Фрибет',
    bonusAmount: 25000,
    features: ['Высокие коэффициенты', 'Широкая линия событий', 'Профессиональная поддержка'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 8,
    name: 'Olimpbet',
    logo: 'OB',
    logoImage: olimpbetLogo,
    rating: 4.3,
    bonus: 'До 8 000 ₽ Фрибет',
    bonusAmount: 8000,
    features: ['Высокие лимиты', 'Широкая линия', 'Удобный интерфейс'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 9,
    name: 'Baltbet',
    logo: 'BT',
    logoImage: baltbetLogo,
    rating: 4.2,
    bonus: 'До 8 000 ₽ Фрибет',
    bonusAmount: 8000,
    features: ['Неплохие выплаты', 'Кэшбэк до 8%', 'Хорошие коэффициенты'],
    license: 'Лицензия ФНС России',
  },
  {
    id: 10,
    name: 'Melbet',
    logo: 'ML',
    logoImage: melbetLogo,
    rating: 4.5,
    bonus: 'До 15 000 ₽ Фрибет',
    bonusAmount: 15000,
    features: ['Огромная линия', 'Круглосуточная поддержка', 'Высокие коэффициенты'],
    license: 'Международная лицензия',
  },
];

export function BonusesTab() {
  const topBookmaker = bookmakers[0];
  const otherBookmakers = bookmakers.slice(1);

  return (
    <div className="space-y-6 px-4">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-br from-green-400/10 via-zinc-900/50 to-zinc-900/50 border border-green-400/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-400/20 flex items-center justify-center">
              <Gift className="size-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl text-white text-[24px] font-bold">Лучшие бонусы</h2>
              <p className="text-sm text-zinc-400 text-[15px] font-bold">Эксклюзивные предложения от топовых букмекеров</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Card Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white font-bold text-[24px]">
            <TrendingUp className="size-5 text-green-400" />
            Лучшее предложение
          </h3>
        </div>
        
        {/* Large Hero Card */}
        <div className="bg-gradient-to-br from-green-400/5 via-zinc-900/50 to-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {topBookmaker.logoImage ? (
                    <div className="size-16 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={topBookmaker.logoImage} alt={topBookmaker.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-2xl text-zinc-900 text-[24px]">
                      {topBookmaker.logo}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg text-white mb-1 font-bold text-[20px]">{topBookmaker.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-green-400 text-green-400" />
                      <span className="text-sm text-green-400 font-bold">{topBookmaker.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
                <p className="text-base text-[rgb(0,220,111)] font-bold text-[18px]">{topBookmaker.bonus}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {topBookmaker.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="size-1.5 rounded-full bg-green-400" />
                    <span className="font-bold text-[16px]">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className="w-full bg-green-400 hover:bg-green-500 text-zinc-900 text-base h-12 rounded-lg transition-colors font-bold">
                Получить бонус
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-8" />
      </div>

      {/* Other Bookmakers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg text-white font-bold text-[26px]">
            <Award className="size-5 text-green-400" />
            Другие букмекеры
          </h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherBookmakers.map((bookmaker) => (
            <BookmakerCard key={bookmaker.id} bookmaker={bookmaker} />
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-800 my-8" />

      {/* Warning Section */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-[20px]">
        <p className="text-sm text-amber-400/80 text-[16px] font-bold text-center">
          ⚠️ Участие в азартных играх может вызвать игровую зависимость. 18+
        </p>
      </div>
    </div>
  );
}