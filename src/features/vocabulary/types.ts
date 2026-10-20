// Shape of public/data/*.min.json (short keys keep the files small)
export type RawReading = { t: string; i: { y?: string; n?: string }; m: string[]; c: string[] };
export type RawWord = { s: string; r: string; q: number; p: string[]; l: number; f: RawReading[] };

export type HskLevel = 1 | 2 | 3;

export type Reading = { pinyin: string; meanings: string[] };

export type Word = {
  hanzi: string;
  traditional: string;
  // The level where the word first appears in the HSK 3.0 syllabus
  level: HskLevel;
  pinyin: string;
  meaning: string;
  readings: Reading[];
};
