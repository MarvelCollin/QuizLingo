import type { ReactNode } from 'react';
import type { HskLevel } from '../vocabulary/types';

export type RawSentence = { i: number; z: string; w: string[]; p: string[]; e: string; l: number };

export type Sentence = {
  id: number;
  text: string;
  tokens: string[];
  pinyin: string[];
  english: string;
  level: HskLevel;
};

export type RawHanzi = { c: string; l: number; x: number; y: string; n: string; m: string[]; w: string[] };

export type WriteLevel = 0 | 2 | 3 | 4 | 5 | 6 | 7;

export type Hanzi = {
  char: string;
  level: HskLevel;
  writeLevel: WriteLevel;
  pinyin: string;
  numeric: string;
  meanings: string[];
  words: string[];
};

export type RawAudioIndex = { words: string[]; syllables: string[] };

export type AudioIndex = { words: Set<string>; syllables: Set<string> };

export type SentenceIndex = { all: Sentence[]; byWord: Map<string, Sentence[]> };

export type SentenceViewProps = {
  sentence: Sentence;
  highlight?: string;
  isPinyinShown?: boolean;
  isEnglishShown?: boolean;
  size?: 'md' | 'lg';
};

export type SourceNoteProps = { sentence: Sentence };

export type SpeakTokenProps = { token: string; className?: string; children?: ReactNode };

export type CharacterSoundsProps = { text: string };
