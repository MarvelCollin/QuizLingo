import { useRef, useState } from 'react';
import { useSaveAnswer } from '../progress/use-save-answer';
import { useSaveRound } from '../progress/use-save-round';
import type { Answer, WordProgress } from '../progress/types';
import type { HskLevel, Word } from '../vocabulary/types';
import { PRACTICE_MODES } from './constants';
import { afterAnswer, startSession, type SessionState } from './session-queue';
import type { AnswerRecord, PracticeModeId } from './types';

export const useRound = (words: Word[], progress: Map<string, WordProgress>, mode: PracticeModeId) => {
  const [session, setSession] = useState<SessionState>(() => startSession(words, progress));
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState<boolean | null>(null);
  const pendingRef = useRef<boolean | null>(null);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const recordsRef = useRef<AnswerRecord[]>([]);
  const savedOnce = useRef(new Set<string>());
  const [unsaved, setUnsaved] = useState<Answer[]>([]);
  const saveAnswer = useSaveAnswer();
  const saveRound = useSaveRound();

  const isDone = session.queue.length === 0;
  const current = isDone ? null : session.queue[0];
  const hasAnsweredCurrent = pending !== null;

  const save = (answer: Answer) =>
    saveAnswer.mutate(answer, { onError: () => setUnsaved((list) => [...list, answer]) });

  const answer = (isCorrect: boolean) => {
    if (!current || pendingRef.current !== null) return;
    pendingRef.current = isCorrect;
    setPending(isCorrect);
    recordsRef.current = [...recordsRef.current, { word: current, isCorrect }];
    setRecords(recordsRef.current);
    const isFirst = !savedOnce.current.has(current.hanzi);
    savedOnce.current.add(current.hanzi);
    if (isFirst || !isCorrect) save({ word: current.hanzi, level: current.level, correct: isCorrect });
  };

  const finish = () => {
    const final = recordsRef.current;
    const firstTries = new Map<string, boolean>();
    for (const r of final) if (!firstTries.has(r.word.hanzi)) firstTries.set(r.word.hanzi, r.isCorrect);
    const roundLevel = Math.max(...words.map((w) => w.level)) as HskLevel;
    saveRound.mutate({
      mode: PRACTICE_MODES.find((m) => m.id === mode)!.apiMode,
      level: roundLevel,
      total: firstTries.size,
      correct: [...firstTries.values()].filter(Boolean).length,
    });
  };

  const next = () => {
    const result = pendingRef.current;
    if (isDone || result === null) return;
    const updated = afterAnswer(session, result);
    setSession(updated);
    pendingRef.current = null;
    setPending(null);
    setStep(step + 1);
    if (updated.queue.length === 0) finish();
  };

  const retryUnsaved = () => {
    const list = unsaved;
    setUnsaved([]);
    list.forEach(save);
  };

  return {
    index: step,
    total: session.total,
    learned: session.done.length,
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
