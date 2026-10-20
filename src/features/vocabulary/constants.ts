import type { HskLevel } from './types';

export const LEVELS: readonly HskLevel[] = [1, 2, 3, 4, 5, 6, 7];

export const levelLabel = (level: HskLevel) => (level === 7 ? 'HSK 7-9' : `HSK ${level}`);
