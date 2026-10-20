import { queryOptions, useQueries, useQuery } from '@tanstack/react-query';
import { LEVELS } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { fetchListeningLevel } from './api';

export const listeningQuery = (level: HskLevel) =>
  queryOptions({
    queryKey: ['listening', level],
    queryFn: () => fetchListeningLevel(level),
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useListeningLevel = (level: HskLevel) => useQuery(listeningQuery(level));

export const useAllListening = () =>
  useQueries({
    queries: LEVELS.map(listeningQuery),
    combine: (results) => ({
      data: results.every((r) => r.data) ? results.flatMap((r) => r.data!) : undefined,
      isPending: results.some((r) => r.isPending),
      isError: results.some((r) => r.isError),
    }),
  });
