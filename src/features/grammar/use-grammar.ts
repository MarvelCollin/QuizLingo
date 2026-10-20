import { queryOptions, useQuery } from '@tanstack/react-query';
import type { HskLevel } from '../vocabulary/types';
import type { GrammarPoint } from './types';

const fetchGrammar = async (level: HskLevel): Promise<GrammarPoint[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/grammar-${level}.json`);
  if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json')) return [];
  const points = (await response.json()) as Omit<GrammarPoint, 'level'>[];
  return points.map((p) => ({ ...p, level }));
};

const grammarQuery = (level: HskLevel) =>
  queryOptions({ queryKey: ['grammar', level], queryFn: () => fetchGrammar(level), staleTime: Infinity, gcTime: Infinity });

export const useGrammar = (level: HskLevel) => useQuery(grammarQuery(level));
