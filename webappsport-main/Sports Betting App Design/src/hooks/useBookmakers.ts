import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Bookmaker } from '../types';

export function useBookmakers() {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmakers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getBookmakers();
        setBookmakers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки букмекеров');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmakers();
  }, []);

  return { bookmakers, loading, error };
}



