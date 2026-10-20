import type { WordProgress, WordStatus } from './types';

// Matches MASTERED_BOX in api/_lib/srs.ts
export const MASTERED_BOX = 4;

export const wordStatus = (progress: WordProgress | undefined, now: number): WordStatus => {
  if (!progress) return 'new';
  if (progress.dueAt <= now) return 'due';
  if (progress.box >= MASTERED_BOX) return 'mastered';
  return 'learning';
};

export const STATUS_LABELS: Record<WordStatus, string> = {
  new: 'New',
  learning: 'Learning',
  due: 'Due',
  mastered: 'Mastered',
};
