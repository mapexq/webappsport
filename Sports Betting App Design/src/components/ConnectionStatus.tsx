import { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

type ConnectionIssue = 'offline' | null;

interface ConnectionStatusProps {
  issue: ConnectionIssue;
  onRetry: () => void;
}

export function ConnectionStatus({ issue, onRetry }: ConnectionStatusProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    onRetry();
    
    // Сброс состояния загрузки через 1.5 секунды
    setTimeout(() => {
      setIsChecking(false);
    }, 1500);
  };

  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-16 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/30">
            <WifiOff className="size-8 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl text-white font-bold text-center mb-2 text-[24px]">
          Нет подключения к интернету
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-center mb-6 leading-relaxed font-bold">
          Приложение требует активное подключение к интернету. 
          Проверьте подключение к сети и попробуйте снова.
        </p>

        {/* Additional Info */}
        <div className="rounded-lg p-4 mb-6 bg-red-500/10 border border-red-500/20">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2 text-zinc-300">
              <span className="text-red-400 mt-0.5">•</span>
              <span>Проверьте Wi-Fi или мобильные данные</span>
            </li>
            <li className="flex items-start gap-2 text-zinc-300">
              <span className="text-red-400 mt-0.5">•</span>
              <span>Убедитесь, что роутер включен</span>
            </li>
            <li className="flex items-start gap-2 text-zinc-300">
              <span className="text-red-400 mt-0.5">•</span>
              <span>Попробуйте перезагрузить устройство</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full bg-green-400 text-zinc-900 hover:bg-green-500 font-bold h-12"
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                Проверка...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4" />
                Повторить попытку
              </div>
            )}
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-zinc-600 text-center mt-4 font-bold">
          После восстановления подключения нажмите "Повторить попытку"
        </p>
      </div>
    </div>
  );
}
