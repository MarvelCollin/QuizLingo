import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchVocabulary } from './api';

// The word list is a static file, so it is fetched once and kept for the whole visit
export const vocabularyQuery = queryOptions({
  queryKey: ['vocabulary'],
  queryFn: fetchVocabulary,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useVocabulary = () => useQuery(vocabularyQuery);
