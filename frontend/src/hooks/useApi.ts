import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T = any>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
}
