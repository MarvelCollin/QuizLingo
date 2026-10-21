import type { HskLevel } from '../vocabulary/types';

export type Speaker = '男' | '女' | '旁白';

export type ScriptLine = { speaker: Speaker; zh: string; py: string; en: string };

export type ListeningQuestion = {
  prompt: string;
  promptPy: string;
  promptEn: string;
  options: string[];
  answer: number;
  line: number;
  explanation: string;
};

export type ListeningTest = {
  id: string;
  title: string;
  scene: string;
  lines: ScriptLine[];
  questions: ListeningQuestion[];
  level: HskLevel;
};

export type ScriptPlayer = {
  current: number;
  isPlaying: boolean;
  failure: string | null;
  rate: number;
  setRate: (rate: number) => void;
  playFrom: (index: number) => void;
  playLine: (index: number) => void;
  pause: () => void;
  toggle: () => void;
};

export type AudioBarProps = { player: ScriptPlayer; total: number };

export type ScriptViewProps = {
  lines: ScriptLine[];
  player: ScriptPlayer;
  focusLine: number | null;
  isPinyinShown: boolean;
  isEnglishShown: boolean;
  dictionary?: Set<string>;
};

export type QuestionCardProps = {
  question: ListeningQuestion;
  number: number;
  chosen: number | null;
  isReviewing: boolean;
  onChoose: (option: number) => void;
  onLocate: () => void;
};

export type ListeningTestViewProps = { test: ListeningTest };

export type TestListProps = { tests: ListeningTest[] };
