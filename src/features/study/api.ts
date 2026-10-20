import type { HskLevel } from '../vocabulary/types';
import type { AudioIndex, Hanzi, RawAudioIndex, RawHanzi, RawSentence, Sentence, SentenceIndex, WriteLevel } from './types';

const fetchData = async <T>(file: string): Promise<T> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
  if (!response.ok) throw new Error('Study data could not be loaded. Reload the page to try again.');
  return (await response.json()) as T;
};

const PUNCTUATION = /^[，。？！、：；“”‘’（）《》…—,.?!:;\d]+$/;

export const isWordToken = (token: string) => !PUNCTUATION.test(token);

export const fetchSentences = async (): Promise<SentenceIndex> => {
  const raw = await fetchData<RawSentence[]>('sentences.min.json');
  const all: Sentence[] = raw.map((s) => ({
    id: s.i,
    text: s.z,
    tokens: s.w,
    pinyin: s.p,
    english: s.e,
    level: s.l as HskLevel,
  }));
  const byWord = new Map<string, Sentence[]>();
  for (const sentence of all) {
    for (const token of new Set(sentence.tokens.filter(isWordToken))) {
      if (!byWord.has(token)) byWord.set(token, []);
      byWord.get(token)!.push(sentence);
    }
  }
  return { all, byWord };
};

export const fetchHanzi = async (): Promise<Hanzi[]> =>
  (await fetchData<RawHanzi[]>('hanzi.min.json')).map((h) => ({
    char: h.c,
    level: h.l as HskLevel,
    writeLevel: h.x as WriteLevel,
    pinyin: h.y,
    numeric: h.n,
    meanings: h.m,
    words: h.w,
  }));

export const fetchAudioIndex = async (): Promise<AudioIndex> => {
  const raw = await fetchData<RawAudioIndex>('audio.json');
  return { words: new Set(raw.words), syllables: new Set(raw.syllables) };
};
