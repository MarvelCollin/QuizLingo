import { useRef, useState } from 'react';
import { useSaveAnswer } from '../progress/use-save-answer';
import { useSaveRound } from '../progress/use-save-round';
import type { Answer } from '../progress/types';
import type { HskLevel, Word } from '../vocabulary/types';
import { PRACTICE_MODES } from './constants';
import type { AnswerRecord, LevelFilter, PracticeModeId } from './types';

// Runs one round: records each answer, saves it straight away, and saves the summary at the end
export const useRound = (words: Word[], mode: PracticeModeId, level: LevelFilter) => {
  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  // Mirrors records so next() sees an answer given in the same click (flashcards grade and advance at once)
  const recordsRef = useRef<AnswerRecord[]>([]);
  const [unsaved, setUnsaved] = useState<Answer[]>([]);
  const saveAnswer = useSaveAnswer();
  const saveRound = useSaveRound();

  const isDone = index >= words.length;
  const current = isDone ? null : words[index];
  const hasAnsweredCurrent = records.length > index;

  const save = (answer: Answer) =>
    saveAnswer.mutate(answer, { onError: () => setUnsaved((list) => [...list, answer]) });

  const answer = (isCorrect: boolean) => {
    if (!current || recordsRef.current.length > index) return;
    recordsRef.current = [...recordsRef.current, { word: current, isCorrect }];
    setRecords(recordsRef.current);
    save({ word: current.hanzi, level: current.level, correct: isCorrect });
  };

  const next = () => {
    if (isDone) return;
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex === words.length) {
      const final = recordsRef.current;
      const correct = final.filter((r) => r.isCorrect).length;
      const roundLevel = (level === 'all' ? Math.min(...words.map((w) => w.level)) : Number(level)) as HskLevel;
      saveRound.mutate({
        mode: PRACTICE_MODES.find((m) => m.id === mode)!.apiMode,
        level: roundLevel,
        total: final.length,
        correct,
      });
    }
  };

  const retryUnsaved = () => {
    const pending = unsaved;
    setUnsaved([]);
    pending.forEach(save);
  };

  return {
    index,
    total: words.length,
    current,
    records,
    isDone,
    hasAnsweredCurrent,
    answer,
    next,
    unsavedCount: unsaved.length,
    isSavingRound: saveRound.isPending,
    roundSaveError: saveRound.error,
    retryUnsaved,
  };
};
