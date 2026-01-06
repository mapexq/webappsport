import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Prediction } from '../types';

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getPredictions();
        setPredictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки прогнозов');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const refreshPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.refreshPredictions();
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления прогнозов');
    } finally {
      setLoading(false);
    }
  };

  return { predictions, loading, error, refreshPredictions };
}

