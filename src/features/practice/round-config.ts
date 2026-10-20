import { DEFAULT_CONFIG, LEVEL_FILTERS, PRACTICE_MODES, ROUND_SIZES } from './constants';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter, RoundConfig, RoundSize, WordSetId } from './types';

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

// The round lives in the URL, so a link can open a ready-made round and Back works
export const configFromParams = (params: URLSearchParams): RoundConfig => ({
  mode: pick(params.get('mode'), PRACTICE_MODES.map((m) => m.id), DEFAULT_CONFIG.mode),
  set: pick<WordSetId>(params.get('set'), ['due', 'new', 'all'], DEFAULT_CONFIG.set),
  level: pick<LevelFilter>(params.get('level'), LEVEL_FILTERS, DEFAULT_CONFIG.level),
  size: pick<RoundSize>(params.get('size'), ROUND_SIZES, DEFAULT_CONFIG.size),
});

export const configToSearch = (config: RoundConfig) => `?${new URLSearchParams(config).toString()}`;

export const highestLevel = (level: LevelFilter): HskLevel => (level === 'all' ? 7 : (Number(level) as HskLevel));
