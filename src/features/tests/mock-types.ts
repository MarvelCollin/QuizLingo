import type { HskLevel } from '../vocabulary/types';
import type { ScriptLine } from './types';

export type SectionKey = 'listening' | 'reading' | 'writing';

export type MockFormatSection = { key: SectionKey; label: string; count: number; minutes: number };

export type MockFormat = {
  sections: MockFormatSection[];
  total: number;
  pass: number;
  plays: number;
  isScoringEstimated: boolean;
};

type ItemBase = { id: string; explanation: string; transcript: string };

export type ChoiceItem = ItemBase & {
  kind: 'choice';
  instruction: string;
  prompt: string;
  promptEn: string;
  passage: string[];
  audio: ScriptLine[];
  audioKey: string;
  options: string[];
  answer: number;
};

export type OrderItem = ItemBase & {
  kind: 'order';
  instruction: string;
  english: string;
  pieces: string[];
  target: string;
};

export type MockItem = ChoiceItem | OrderItem;

export type MockSection = MockFormatSection & { items: MockItem[] };

export type MockPaper = { level: HskLevel; format: MockFormat; sections: MockSection[] };

export type MockAnswer = number | number[] | null;

export type SectionResult = { key: SectionKey; label: string; correct: number; total: number; points: number };

export type MockItemViewProps = {
  item: MockItem;
  number: number;
  answer: MockAnswer;
  playsLeft: number;
  isReviewing: boolean;
  onAnswer: (answer: MockAnswer) => void;
  onPlay: (item: ChoiceItem) => void;
};

export type NavigatorProps = {
  items: MockItem[];
  answers: MockAnswer[];
  current: number;
  isReviewing: boolean;
  onJump: (index: number) => void;
};

export type MockResultsProps = {
  paper: MockPaper;
  answers: MockAnswer[][];
  onReview: (section: number, item: number) => void;
  onRestart: () => void;
};

export type MockStage = { kind: 'section'; section: number } | { kind: 'results' } | { kind: 'review'; section: number };

export type MockRunProps = { paper: MockPaper; onRestart: () => void };
