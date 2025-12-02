import { BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Prediction } from './PredictionsTab';
import { useState } from 'react';

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const isExpert = prediction.expert.status === 'expert';
  const [isExpanded, setIsExpanded] = useState(false);
  
  const MAX_LENGTH = 130;
  const shouldTruncate = prediction.comment.length > MAX_LENGTH;
  const displayedComment = shouldTruncate && !isExpanded 
    ? prediction.comment.slice(0, MAX_LENGTH) + '...' 
    : prediction.comment;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-400/30 transition-all">
      {/* Header with discipline and odds */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-zinc-900/50 text-zinc-400 border-zinc-700 h-8 px-3 text-xs">
              {prediction.discipline}
            </Badge>
            <span className="text-zinc-600">•</span>
            <span className="text-sm text-zinc-500 font-bold">{prediction.tournament}</span>
          </div>
          <h3 className="text-lg text-white font-bold text-[20px]">{prediction.eventName}</h3>
        </div>
        <div className="text-right">
          <div className="text-3xl text-green-400 font-bold">{prediction.odds}</div>
          <div className="text-xs text-zinc-500 font-bold">коэфф.</div>
        </div>
      </div>

      {/* Expert Profile */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <img
          src={prediction.expert.avatar}
          alt={prediction.expert.name}
          className="size-12 rounded-full object-cover"
        />
        <div>
          <div className="text-base text-white mb-1 font-bold">{prediction.expert.name}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 font-bold">
              {isExpert ? 'Эксперт' : 'Любитель'}
            </span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-green-400 font-bold">
              {prediction.expert.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
        <div className="text-xs text-zinc-500 mb-2 font-bold">Прогноз</div>
        <div className="text-base text-green-400 font-bold">{prediction.prediction}</div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <p className="text-zinc-400 leading-relaxed font-bold text-[15px]">
          {displayedComment}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-green-400 text-sm font-bold flex items-center gap-1 hover:text-green-300 transition-colors"
          >
            {isExpanded ? (
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

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="font-bold text-[14px]">{prediction.timestamp}</span>
        <span className="font-bold text-[14px]">{prediction.source}</span>
      </div>
    </div>
  );
}