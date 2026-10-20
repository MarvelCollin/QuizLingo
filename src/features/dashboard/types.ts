import type { LevelStats, RecentRound, Stats } from '../progress/types';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter } from '../practice/types';

export type SummaryStripProps = { mastered: number; totalWords: number; accuracy: number | null; streak: number };

export type RecentRoundsProps = { rounds: RecentRound[] };

export type NextStepProps = { due: number; nextNewLevel: LevelFilter | null; isFirstVisit: boolean };

export type LevelProgressProps = { totals: Record<HskLevel, number>; stats: LevelStats[] };

export type ActivityChartProps = { activity: Stats['activity'] };
