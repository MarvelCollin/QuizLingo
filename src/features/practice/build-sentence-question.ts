import { shuffle } from '../../lib/random';
import { isWordToken } from '../study/api';
import type { Sentence, SentenceIndex } from '../study/types';
import type { Word } from '../vocabulary/types';
import { buildQuestion } from './build-question';
import { OPTION_COUNT } from './constants';
import type { ChoiceOption, SentenceModeId, SentenceQuestion } from './types';

const wordCount = (sentence: Sentence) => sentence.tokens.filter(isWordToken).length;

const fitsMode = (sentence: Sentence, mode: SentenceModeId) =>
  mode === 'order' ? wordCount(sentence) >= 3 && wordCount(sentence) <= 8 : true;

export const sentencesFor = (word: Word, mode: SentenceModeId, index: SentenceIndex) =>
  (index.byWord.get(word.hanzi) ?? []).filter((s) => fitsMode(s, mode));

export const hasSentence = (word: Word, mode: SentenceModeId, index: SentenceIndex) =>
  sentencesFor(word, mode, index).length > 0;

const plainEnglish = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');

const englishOptions = (sentence: Sentence, index: SentenceIndex): ChoiceOption[] => {
  const used = new Set([plainEnglish(sentence.english)]);
  const near = shuffle(index.all.filter((s) => s.level === sentence.level && s.id !== sentence.id));
  const rest = shuffle(index.all.filter((s) => s.level !== sentence.level));
  const picked: ChoiceOption[] = [];
  for (const other of [...near, ...rest]) {
    const key = plainEnglish(other.english);
    if (used.has(key)) continue;
    used.add(key);
    picked.push({ label: other.english, isHanzi: false, isCorrect: false });
    if (picked.length === OPTION_COUNT - 1) break;
  }
  return shuffle([{ label: sentence.english, isHanzi: false, isCorrect: true }, ...picked]);
};

const orderPieces = (sentence: Sentence) => {
  const words = sentence.tokens.filter(isWordToken);
  for (let attempt = 0; attempt < 6; attempt++) {
    const mixed = shuffle(words);
    if (mixed.join('') !== words.join('')) return mixed;
  }
  return [...words].reverse();
};

export const buildSentenceQuestion = (
  word: Word,
  mode: SentenceModeId,
  pool: Word[],
  index: SentenceIndex,
): SentenceQuestion | null => {
  const choices = sentencesFor(word, mode, index);
  if (choices.length === 0) return null;
  const sentence = choices[Math.floor(Math.random() * choices.length)];
  if (mode === 'gap') return { word, sentence, options: buildQuestion(word, 'listening', pool).options, pieces: [] };
  if (mode === 'order') return { word, sentence, options: [], pieces: orderPieces(sentence) };
  return { word, sentence, options: englishOptions(sentence, index), pieces: [] };
};
