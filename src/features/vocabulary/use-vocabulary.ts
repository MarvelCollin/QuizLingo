import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchVocabulary } from './api';

export const vocabularyQuery = queryOptions({
  queryKey: ['vocabulary'],
  queryFn: fetchVocabulary,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useVocabulary = () => useQuery(vocabularyQuery);
