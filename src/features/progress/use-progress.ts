import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchProgress } from './api';
import type { WordProgress } from './types';

export const progressKey = ['progress'] as const;

// Progress for every word the user has practiced, as a lookup by word
export const useProgress = () => {
  const query = useQuery({ queryKey: progressKey, queryFn: fetchProgress });
  const byWord = useMemo(
    () => new Map<string, WordProgress>((query.data ?? []).map((p) => [p.word, p])),
    [query.data],
  );
  return { ...query, byWord };
};
