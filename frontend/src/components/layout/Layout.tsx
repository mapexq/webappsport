import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gift, TrendingUp, Newspaper, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/bonuses', label: 'Бонусы', icon: Gift },
  { path: '/forecasts', label: 'Прогнозы', icon: TrendingUp },
  { path: '/news', label: 'Новости', icon: Newspaper },
  { path: '/articles', label: 'Статьи', icon: BookOpen },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 py-4">
          <h1 className="text-center bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent text-[36px] font-bold">
            BETPRO
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/98 backdrop-blur-md border-t border-zinc-800 z-50">
        <div className="grid grid-cols-4 max-w-7xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path === '/bonuses' && location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                  isActive
                    ? 'text-green-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon 
                  className={`size-6 mb-1 transition-all ${
                    isActive ? 'drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''
                  }`} 
                />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

