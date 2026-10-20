import { HttpError } from './http.js';

export const MODES = [
  'flashcard',
  'quiz',
  'listening',
  'pinyin',
  'reading',
  'sentence-listening',
  'order',
  'gap',
  'hanzi',
  'writing',
  'tones',
  'listening-test',
  'mock-test',
  'speaking',
] as const;
export type Mode = (typeof MODES)[number];

export const level = (value: unknown): number => {
  if (value === 1 || value === 2 || value === 3) return value;
  throw new HttpError(400, 'Level must be 1, 2 or 3.');
};

export const mode = (value: unknown): Mode => {
  if (typeof value === 'string' && (MODES as readonly string[]).includes(value)) return value as Mode;
  throw new HttpError(400, `Mode must be one of ${MODES.join(', ')}.`);
};

export const word = (value: unknown): string => {
  if (typeof value === 'string' && value.length > 0 && value.length <= 16) return value;
  throw new HttpError(400, 'Each result needs a word of 1 to 16 characters.');
};

export const count = (value: unknown, max: number): number => {
  if (Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max) return value as number;
  throw new HttpError(400, `Counts must be whole numbers from 0 to ${max}.`);
};
