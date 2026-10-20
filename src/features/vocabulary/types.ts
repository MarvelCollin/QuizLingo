export type RawReading = { t: string; i: { y?: string; n?: string }; m: string[] };
export type RawWord = { s: string; l: number; f: RawReading[] };

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Reading = { pinyin: string; numeric: string; meanings: string[] };

export type Word = {
  hanzi: string;
  traditional: string;
  level: HskLevel;
  pinyin: string;
  meaning: string;
  readings: Reading[];
};
