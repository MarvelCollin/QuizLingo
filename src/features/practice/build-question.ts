import { shuffle } from '../../lib/random';
import { plainPinyin } from '../vocabulary/pinyin';
import type { Word } from '../vocabulary/types';
import { OPTION_COUNT } from './constants';
import type { ChoiceOption, PracticeModeId, Question } from './types';

const optionFor = (word: Word, mode: PracticeModeId, isCorrect: boolean): ChoiceOption => {
  if (mode === 'meaning') return { label: word.meaning, isHanzi: false, isCorrect };
  if (mode === 'pinyin') return { label: word.readings[0].pinyin, isHanzi: false, isCorrect };
  return { label: word.hanzi, isHanzi: true, isCorrect };
};

// A wrong option must not also be a right answer: no shared meaning, and no shared sound for listening
const isFairDistractor = (candidate: Word, word: Word, mode: PracticeModeId) => {
  if (candidate.hanzi === word.hanzi) return false;
  if (mode === 'meaning') return candidate.meaning !== word.meaning;
  if (mode === 'pinyin') return candidate.readings[0].pinyin !== word.readings[0].pinyin;
  return plainPinyin(candidate.pinyin) !== plainPinyin(word.pinyin);
};

// Prefer distractors that look alike: the same number of characters, then the same level
export const buildQuestion = (word: Word, mode: PracticeModeId, pool: Word[]): Question => {
  if (mode === 'flashcard') return { word, options: [] };
  const fair = pool.filter((candidate) => isFairDistractor(candidate, word, mode));
  const similar = fair.filter((c) => c.hanzi.length === word.hanzi.length && c.level === word.level);
  const ranked = [...shuffle(similar), ...shuffle(fair.filter((c) => !similar.includes(c)))];

  const distractors: Word[] = [];
  const seen = new Set([optionFor(word, mode, true).label]);
  for (const candidate of ranked) {
    const label = optionFor(candidate, mode, false).label;
    if (seen.has(label)) continue;
    seen.add(label);
    distractors.push(candidate);
    if (distractors.length === OPTION_COUNT - 1) break;
  }

  return {
    word,
    options: shuffle([optionFor(word, mode, true), ...distractors.map((d) => optionFor(d, mode, false))]),
  };
};
