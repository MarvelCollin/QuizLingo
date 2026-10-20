import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAnswers } from './api';
import { progressKey } from './use-progress';
import { statsKey } from './use-stats';
import type { Answer, WordProgress } from './types';

export const useSaveAnswers = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (answers: Answer[]) => saveAnswers(answers),
    retry: 2,
    onSuccess: (updated) => {
      client.setQueryData<WordProgress[]>(progressKey, (current = []) => {
        const next = new Map(current.map((p) => [p.word, p]));
        for (const p of updated) next.set(p.word, p);
        return [...next.values()];
      });
      void client.invalidateQueries({ queryKey: statsKey });
    },
  });
};
