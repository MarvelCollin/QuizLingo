import type { HskLevel, RawWord, Word } from './types';

const toWord = (raw: RawWord): Word => {
    // Dictionary glosses join senses with semicolons. Commas read better in the UI.
  const readings = raw.f.map((form) => ({
    pinyin: form.i.y ?? '',
    meanings: form.m.map((m) => m.replace(/\s*;\s*/g, ', ')),
  }));
  return {
    hanzi: raw.s,
    traditional: raw.f[0]?.t ?? raw.s,
    level: raw.l as HskLevel,
    pinyin: readings.map((r) => r.pinyin).join(', '),
    meaning: readings[0]?.meanings[0] ?? '',
    readings,
  };
};

// 3.min.json is cumulative, so it holds every word from HSK 1 to 3
export const fetchVocabulary = async (): Promise<Word[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/3.min.json`);
  if (!response.ok) throw new Error('The word list could not be loaded. Reload the page to try again.');
  const raw = (await response.json()) as RawWord[];
  return raw.map(toWord);
};
