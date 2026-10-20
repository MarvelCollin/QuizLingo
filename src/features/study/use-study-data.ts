import { queryOptions, useQueries, useQuery } from '@tanstack/react-query';
import { LEVELS } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { buildSentenceIndex, fetchAudioIndex, fetchHanzi, fetchSentenceLevel } from './api';
import type { Sentence } from './types';

const forever = { staleTime: Infinity, gcTime: Infinity } as const;

export const sentenceLevelQuery = (level: HskLevel) =>
  queryOptions({ queryKey: ['sentences', level], queryFn: () => fetchSentenceLevel(level), ...forever });
export const hanziQuery = queryOptions({ queryKey: ['hanzi'], queryFn: fetchHanzi, ...forever });
export const audioIndexQuery = queryOptions({ queryKey: ['audio-index'], queryFn: fetchAudioIndex, ...forever });

const indexCache = new Map<HskLevel, ReturnType<typeof buildSentenceIndex>>();

const combined = (maxLevel: HskLevel, parts: Sentence[][]) => {
  if (!indexCache.has(maxLevel)) indexCache.set(maxLevel, buildSentenceIndex(parts.flat()));
  return indexCache.get(maxLevel)!;
};

export const useSentences = (maxLevel: HskLevel = 7) =>
  useQueries({
    queries: LEVELS.filter((l) => l <= maxLevel).map(sentenceLevelQuery),
    combine: (results) => {
      const isPending = results.some((r) => r.isPending);
      const failed = results.find((r) => r.isError);
      return {
        data: isPending || failed ? undefined : combined(maxLevel, results.map((r) => r.data!)),
        isPending,
        isError: Boolean(failed),
        error: failed?.error ?? null,
        refetch: () => Promise.all(results.map((r) => r.refetch())),
      };
    },
  });

export const useHanzi = () => useQuery(hanziQuery);
export const useAudioIndex = () => useQuery(audioIndexQuery);
