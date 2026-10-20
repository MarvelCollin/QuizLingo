import { useRef, useState } from 'react';
import { useSaveRound } from '../progress/use-save-round';
import type { ApiMode } from '../progress/types';
import type { HskLevel } from '../vocabulary/types';

export const useToolRound = <T>(items: T[], mode: ApiMode, level: HskLevel) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const resultsRef = useRef<boolean[]>([]);
  const saveRound = useSaveRound();

  const isDone = index >= items.length;
  const current = isDone ? null : items[index];

  const answer = (isCorrect: boolean) => {
    if (resultsRef.current.length > index) return;
    resultsRef.current = [...resultsRef.current, isCorrect];
    setResults(resultsRef.current);
  };

  const next = () => {
    if (isDone) return;
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex === items.length && resultsRef.current.length > 0) {
      saveRound.mutate({
        mode,
        level,
        total: resultsRef.current.length,
        correct: resultsRef.current.filter(Boolean).length,
      });
    }
  };

  return {
    index,
    total: items.length,
    current,
    isDone,
    results,
    correct: results.filter(Boolean).length,
    answer,
    next,
    isSaving: saveRound.isPending,
    missed: items.filter((_, i) => results[i] === false),
  };
};
