import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchAudioIndex, fetchHanzi, fetchSentences } from './api';

const forever = { staleTime: Infinity, gcTime: Infinity } as const;

export const sentencesQuery = queryOptions({ queryKey: ['sentences'], queryFn: fetchSentences, ...forever });
export const hanziQuery = queryOptions({ queryKey: ['hanzi'], queryFn: fetchHanzi, ...forever });
export const audioIndexQuery = queryOptions({ queryKey: ['audio-index'], queryFn: fetchAudioIndex, ...forever });

export const useSentences = () => useQuery(sentencesQuery);
export const useHanzi = () => useQuery(hanziQuery);
export const useAudioIndex = () => useQuery(audioIndexQuery);
