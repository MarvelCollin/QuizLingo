import type { ToneNumber } from './types';

export const LESSON_PASS = 70;
export const CHECKPOINT_PASS = 80;
export const CHECKPOINT_LENGTH = 10;
export const WORD_QUIZ_LENGTH = 8;
export const OPTION_COUNT = 4;

export const TONE_NAMES: Record<ToneNumber, string> = {
  1: 'Tone 1, high and flat',
  2: 'Tone 2, rising',
  3: 'Tone 3, dipping',
  4: 'Tone 4, falling',
  5: 'Neutral tone, light and short',
};

export const TONE_PITCH: Record<ToneNumber, [number, number, ...number[]]> = {
  1: [5, 5],
  2: [3, 5],
  3: [2, 1, 4],
  4: [5, 1],
  5: [3, 3],
};

export const PASS_LABEL = 'Pass mark';
