import type { LevelStats, RecentRound, Stats } from '../progress/types';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter } from '../practice/types';
import type { LessonState } from '../basics/types';

export type SummaryStripProps = { mastered: number; totalWords: number; accuracy: number | null; streak: number };

export type RecentRoundsProps = { rounds: RecentRound[] };

export type NextStepProps = { due: number; nextNewLevel: LevelFilter | null; stepReady: number; isFirstVisit: boolean };

export type LevelProgressProps = { totals: Record<HskLevel, number>; stats: LevelStats[] };

export type ActivityChartProps = { activity: Stats['activity'] };

export type StarterStripProps = { next: LessonState; stagesDone: number; stagesTotal: number };

export type StarterHeroProps = { next: LessonState | null; isFresh: boolean };
