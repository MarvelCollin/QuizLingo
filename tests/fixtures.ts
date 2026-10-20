import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSentenceIndex } from '../src/features/study/api';
import type { RawSentence, Sentence, SentenceIndex } from '../src/features/study/types';
import { toWord } from '../src/features/vocabulary/api';
import type { HskLevel, RawWord, Word } from '../src/features/vocabulary/types';

export const DATA = join(process.cwd(), 'public', 'data');

export const readData = <T>(file: string): T => JSON.parse(readFileSync(join(DATA, file), 'utf8')) as T;

export const loadWords = () => readData<RawWord[]>('words.min.json').map(toWord);

export const loadSentences = (maxLevel: HskLevel): SentenceIndex => {
  const all: Sentence[] = [];
  for (let level = 1; level <= maxLevel; level++) {
    for (const s of readData<RawSentence[]>(`sentences-${level}.min.json`)) {
      all.push({ id: s.i, text: s.z, tokens: s.w, pinyin: s.p, english: s.e, level: s.l as HskLevel });
    }
  }
  return buildSentenceIndex(all);
};

export const word = (hanzi: string, level: HskLevel, pinyin: string, meaning: string, numeric = ''): Word => ({
  hanzi,
  traditional: hanzi,
  level,
  pinyin,
  meaning,
  readings: [{ pinyin, numeric, meanings: [meaning] }],
});

export const sentence = (id: number, tokens: string[], english: string, level: HskLevel = 1): Sentence => ({
  id,
  text: tokens.join(''),
  tokens,
  pinyin: tokens.map(() => ''),
  english,
  level,
});
