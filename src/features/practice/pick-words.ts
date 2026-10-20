import { shuffle } from '../../lib/random';
import type { WordProgress } from '../progress/types';
import type { Word } from '../vocabulary/types';
import type { LevelFilter, RoundConfig, WordSetId } from './types';

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

// Most overdue words first, new words in syllabus order, then the round is shuffled
export const pickRoundWords = (
  words: Word[],
  config: RoundConfig,
  progress: Map<string, WordProgress>,
  now: number,
) => shuffle(wordsInSet(wordsInLevel(words, config.level), config.set, progress, now).slice(0, Number(config.size)));
