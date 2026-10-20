import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchLessonProgress, resetPath, saveAttempt } from './api';
import { buildPath } from './path-state';
import type { LessonProgress } from './types';

export const basicsKey = ['basics'] as const;

// Every lesson the learner has tried, and the path state worked out from it
export const useBasicsPath = () => {
  const query = useQuery({ queryKey: basicsKey, queryFn: fetchLessonProgress });
  const path = useMemo(() => (query.data ? buildPath(query.data) : null), [query.data]);
  return { ...query, path };
};

export const useSaveAttempt = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveAttempt,
    retry: 2,
    onSuccess: (saved) => {
      client.setQueryData<LessonProgress[]>(basicsKey, (current = []) => [
        ...current.filter((row) => row.lesson !== saved.lesson),
        saved,
      ]);
    },
  });
};

// Clears every lesson score on the account, so the path starts again from the first lesson
export const useResetPath = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: resetPath, onSuccess: () => client.setQueryData<LessonProgress[]>(basicsKey, []) });
};
