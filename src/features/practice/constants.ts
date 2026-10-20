import type { LevelFilter, PracticeMode, RoundConfig, RoundSize, WordSetId } from './types';

export const PRACTICE_MODES: readonly PracticeMode[] = [
  { id: 'flashcard', label: 'Flashcards', detail: 'See the word, then say if you knew it', apiMode: 'flashcard', usesSentences: false, needsVoice: false },
  { id: 'meaning', label: 'Meaning', detail: 'Pick the English meaning', apiMode: 'quiz', usesSentences: false, needsVoice: false },
  { id: 'listening', label: 'Listening', detail: 'Hear the word, pick the characters', apiMode: 'listening', usesSentences: false, needsVoice: true },
  { id: 'pinyin', label: 'Pinyin', detail: 'Pick the right pinyin and tones', apiMode: 'pinyin', usesSentences: false, needsVoice: false },
  { id: 'reading', label: 'Reading', detail: 'Read a sentence with the word, pick what it means', apiMode: 'reading', usesSentences: true, needsVoice: false },
  { id: 'sentence-listening', label: 'Sentence listening', detail: 'Hear a sentence, pick what it means', apiMode: 'sentence-listening', usesSentences: true, needsVoice: true },
  { id: 'gap', label: 'Fill the gap', detail: 'Pick the word that completes the sentence', apiMode: 'gap', usesSentences: true, needsVoice: false },
  { id: 'order', label: 'Word order', detail: 'Put the words in the right order', apiMode: 'order', usesSentences: true, needsVoice: false },
];

export const WORD_SET_LABELS: Record<WordSetId, string> = {
  due: 'Due for review',
  new: 'New words',
  all: 'Mixed',
};

export const LEVEL_FILTERS: readonly LevelFilter[] = ['1', '2', '3', '4', '5', '6', '7', 'all'];

export const LEVEL_LABELS: Record<LevelFilter, string> = {
  all: 'All levels',
  '1': 'HSK 1',
  '2': 'HSK 2',
  '3': 'HSK 3',
  '4': 'HSK 4',
  '5': 'HSK 5',
  '6': 'HSK 6',
  '7': 'HSK 7-9',
};

export const ROUND_SIZES: readonly RoundSize[] = ['10', '20', '30'];

export const DEFAULT_CONFIG: RoundConfig = { mode: 'flashcard', set: 'new', level: '1', size: '10' };

export const OPTION_COUNT = 4;

export const MORE_PRACTICE = [
  { to: '/practice/tones', label: 'Tones', detail: 'Native recordings of syllables and words, pick the tone you hear' },
  { to: '/practice/characters', label: 'Character quiz', detail: 'Recognise each character by its pinyin and meaning' },
  { to: '/practice/writing', label: 'Writing practice', detail: 'Draw the characters you need to write, stroke by stroke' },
  { to: '/practice/speaking', label: 'Speaking', detail: 'Read sentences aloud and see which characters were heard' },
  { to: '/tests', label: 'Listening tests and mock tests', detail: 'Follow a script while you listen, or sit a timed HSK 3.0 mock test' },
] as const;
