import type { WordProgress } from '../progress/types';
import type { Word } from '../vocabulary/types';

export const STEP_START = 30;
export const STEP_GROWTH = 20;
export const KNOWN_BOX = 2;
export const KNOWN_SHARE = 0.9;

export type LearningStep = {
  open: Word[];
  size: number;
  total: number;
  known: number;
  needed: number;
  isComplete: boolean;
};

export const isKnown = (progress: WordProgress | undefined) => (progress?.box ?? 0) >= KNOWN_BOX;

export const stepTarget = (size: number) => Math.ceil(size * KNOWN_SHARE);

export const learningStep = (words: Word[], progress: Map<string, WordProgress>): LearningStep => {
  const ordered = words
    .map((word, index) => ({ word, index }))
    .sort((a, b) => a.word.level - b.word.level || a.index - b.index)
    .map((entry) => entry.word);
  const total = ordered.length;
  const knownBefore = [0];
  for (const word of ordered) knownBefore.push(knownBefore.at(-1)! + (isKnown(progress.get(word.hanzi)) ? 1 : 0));

  let size = Math.min(STEP_START, total);
  while (size < total && knownBefore[size] >= stepTarget(size)) size = Math.min(size + STEP_GROWTH, total);

  const known = knownBefore[size];
  const needed = stepTarget(size);
  return { open: ordered.slice(0, size), size, total, known, needed, isComplete: size === total && known >= needed };
};

export const stepQueue = (open: Word[], progress: Map<string, WordProgress>, now: number) => {
  const due = open
    .filter((w) => (progress.get(w.hanzi)?.dueAt ?? Infinity) <= now)
    .sort((a, b) => progress.get(a.hanzi)!.dueAt - progress.get(b.hanzi)!.dueAt);
  const fresh = open.filter((w) => !progress.has(w.hanzi));
  return [...due, ...fresh];
};
