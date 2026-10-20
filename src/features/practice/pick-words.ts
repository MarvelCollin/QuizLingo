import { shuffle } from '../../lib/random';
import type { WordProgress } from '../progress/types';
import type { SentenceIndex } from '../study/types';
import type { Word } from '../vocabulary/types';
import { hasSentence } from './build-sentence-question';
import { PRACTICE_MODES } from './constants';
import type { LevelFilter, PracticeModeId, RoundConfig, SentenceModeId, WordSetId } from './types';

export const wordsInLevel = (words: Word[], level: LevelFilter) =>
  level === 'all' ? words : words.filter((w) => w.level === Number(level));

export const wordsInSet = (words: Word[], set: WordSetId, progress: Map<string, WordProgress>, now: number) => {
  if (set === 'due') {
    return words
      .filter((w) => (progress.get(w.hanzi)?.dueAt ?? Infinity) <= now)
      .sort((a, b) => progress.get(a.hanzi)!.dueAt - progress.get(b.hanzi)!.dueAt);
  }
  if (set === 'new') return words.filter((w) => !progress.has(w.hanzi));
  return shuffle(words);
};

export const pickRoundWords = (
  words: Word[],
  config: RoundConfig,
  progress: Map<string, WordProgress>,
  now: number,
) => shuffle(wordsInSet(wordsInLevel(words, config.level), config.set, progress, now).slice(0, Number(config.size)));

export const wordsForMode = (words: Word[], mode: PracticeModeId, sentences: SentenceIndex | undefined) => {
  if (!PRACTICE_MODES.find((m) => m.id === mode)!.usesSentences) return words;
  if (!sentences) return [];
  return words.filter((w) => hasSentence(w, mode as SentenceModeId, sentences));
};
