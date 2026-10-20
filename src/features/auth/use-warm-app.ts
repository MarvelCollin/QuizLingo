import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { vocabularyQuery } from '../vocabulary/use-vocabulary';

export const useWarmApp = () => {
  const client = useQueryClient();
  useEffect(() => {
    const warm = () => {
      void client.prefetchQuery(vocabularyQuery);
      void import('../dashboard/dashboard-page');
    };
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(warm, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 500);
    return () => clearTimeout(id);
  }, [client]);
};
