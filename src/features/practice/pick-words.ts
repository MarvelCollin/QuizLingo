import { shuffle } from '../../lib/random';
import type { WordProgress } from '../progress/types';
import type { SentenceIndex } from '../study/types';
import type { Word } from '../vocabulary/types';
import { hasSentence } from './build-sentence-question';
import { learningStep, stepQueue } from './learning-step';
import { PRACTICE_MODES } from './constants';
import type { LevelFilter, PracticeModeId, RoundConfig, SentenceModeId, WordSetId } from './types';

export const wordsInLevel = (words: Word[], level: LevelFilter) =>
  level === 'all' ? words : words.filter((w) => w.level === Number(level));

export const openWordSet = (vocabulary: Word[], level: LevelFilter, progress: Map<string, WordProgress>) =>
  new Set(learningStep(wordsInLevel(vocabulary, level), progress).open.map((w) => w.hanzi));

export const wordsInSet = (
  words: Word[],
  set: WordSetId,
  progress: Map<string, WordProgress>,
  now: number,
  open?: Set<string>,
) => {
  if (set === 'step') {
    const openWords = open ? words.filter((w) => open.has(w.hanzi)) : learningStep(words, progress).open;
    return stepQueue(openWords, progress, now);
  }
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
  vocabulary: Word[] = words,
) => {
  const open = config.set === 'step' ? openWordSet(vocabulary, config.level, progress) : undefined;
  return shuffle(wordsInSet(wordsInLevel(words, config.level), config.set, progress, now, open).slice(0, Number(config.size)));
};

export const wordsForMode = (words: Word[], mode: PracticeModeId, sentences: SentenceIndex | undefined) => {
  if (!PRACTICE_MODES.find((m) => m.id === mode)!.usesSentences) return words;
  if (!sentences) return [];
  return words.filter((w) => hasSentence(w, mode as SentenceModeId, sentences));
};
