import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Gift, TrendingUp, Newspaper, BookOpen } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { Toaster } from './ui/sonner';
import { useAppStore } from '../store/appStore';
import { useNewsRefresh } from '../hooks/useNewsRefresh';

type TabType = 'bonuses' | 'predictions' | 'news' | 'articles';

const tabs = [
  { id: 'bonuses' as TabType, label: 'Бонусы', icon: Gift, path: '/' },
  { id: 'predictions' as TabType, label: 'Прогнозы', icon: TrendingUp, path: '/predictions' },
  { id: 'news' as TabType, label: 'Новости', icon: Newspaper, path: '/news' },
  { id: 'articles' as TabType, label: 'Статьи', icon: BookOpen, path: '/articles' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectionIssue, setConnectionIssue } = useAppStore();
  
  // Автоматическое обновление новостей при заходе в приложение
  useNewsRefresh();

  const handleRetry = () => {
    console.log('Повторная проверка запущена');
    // Здесь будет ваша логика повторной проверки
    // setConnectionIssue(null);
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const getActiveTab = (): TabType => {
    if (location.pathname === '/') return 'bonuses';
    if (location.pathname === '/predictions') return 'predictions';
    if (location.pathname === '/news') return 'news';
    if (location.pathname === '/articles') return 'articles';
    return 'bonuses';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white pb-20">
      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
      
      {/* Connection Status Modal */}
      <ConnectionStatus issue={connectionIssue} onRetry={handleRetry} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 py-4">
          <h1 className="text-center bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent text-[36px] font-[Open_Sans] font-bold no-underline">
            BETPRO
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/98 backdrop-blur-md border-t border-zinc-800 z-50">
        <div className="grid grid-cols-4 max-w-7xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
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
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


