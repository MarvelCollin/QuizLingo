import type { LevelFilter, PracticeMode, RoundConfig, RoundSize, WordSetId } from './types';

export const PRACTICE_MODES: readonly PracticeMode[] = [
  { id: 'flashcard', label: 'Flashcards', detail: 'See the word, then say if you knew it', apiMode: 'flashcard' },
  { id: 'meaning', label: 'Meaning', detail: 'Pick the English meaning', apiMode: 'quiz' },
  { id: 'listening', label: 'Listening', detail: 'Hear the word, pick the characters', apiMode: 'listening' },
  { id: 'pinyin', label: 'Pinyin', detail: 'Pick the right pinyin and tones', apiMode: 'pinyin' },
];

export const WORD_SET_LABELS: Record<WordSetId, string> = {
  due: 'Due for review',
  new: 'New words',
  all: 'Mixed',
};

export const LEVEL_LABELS: Record<LevelFilter, string> = {
  all: 'All levels',
  '1': 'HSK 1',
  '2': 'HSK 2',
  '3': 'HSK 3',
};

export const ROUND_SIZES: readonly RoundSize[] = ['10', '20', '30'];

export const DEFAULT_CONFIG: RoundConfig = { mode: 'flashcard', set: 'new', level: '1', size: '10' };

export const OPTION_COUNT = 4;
