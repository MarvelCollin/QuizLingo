import type { HskLevel } from '../vocabulary/types';

export type WordProgress = {
  word: string;
  level: HskLevel;
  box: number;
  correct: number;
  wrong: number;
  dueAt: number;
  lastSeenAt: number;
};

export type WordStatus = 'new' | 'learning' | 'due' | 'mastered';

export type ApiMode = 'flashcard' | 'quiz' | 'listening' | 'pinyin';

export type Answer = { word: string; level: HskLevel; correct: boolean };

export type RoundSummary = { mode: ApiMode; level: HskLevel; total: number; correct: number };

export type LevelStats = { level: HskLevel; seen: number; mastered: number; due: number };

export type RecentRound = RoundSummary & { id: string; createdAt: number };

export type Stats = {
  levels: LevelStats[];
  answers: { correct: number; wrong: number };
  streak: number;
  activity: { date: string; answers: number }[];
  recent: RecentRound[];
};

export type StatusLabelProps = { status: WordStatus };
