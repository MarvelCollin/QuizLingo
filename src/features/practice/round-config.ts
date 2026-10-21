import { DEFAULT_CONFIG, LEVEL_FILTERS, PRACTICE_MODES } from './constants';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter, RoundConfig, WordSetId } from './types';

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export const configFromParams = (params: URLSearchParams, level: LevelFilter = DEFAULT_CONFIG.level): RoundConfig => ({
  mode: pick(params.get('mode'), PRACTICE_MODES.map((m) => m.id), DEFAULT_CONFIG.mode),
  set: pick<WordSetId>(params.get('set'), ['step', 'due', 'new', 'all'], DEFAULT_CONFIG.set),
  level: pick<LevelFilter>(params.get('level'), LEVEL_FILTERS, level),
});

export const configToSearch = (config: RoundConfig) => `?${new URLSearchParams(config).toString()}`;

export const highestLevel = (level: LevelFilter): HskLevel => (level === 'all' ? 7 : (Number(level) as HskLevel));
