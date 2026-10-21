import type { LevelFilter } from './types';

const KEY = 'quizlingo-target-level-v1';

export const TARGET_LEVELS: readonly LevelFilter[] = ['1', '2', '3', '4', '5', '6', '7'];

const storage = (): Storage | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
};

export const readTargetLevel = (user: string, store: Pick<Storage, 'getItem'> | undefined = storage()): LevelFilter => {
  try {
    const saved = store?.getItem(`${KEY}:${user}`);
    return TARGET_LEVELS.find((level) => level === saved) ?? '1';
  } catch {
    return '1';
  }
};

export const saveTargetLevel = (user: string, level: LevelFilter, store: Pick<Storage, 'setItem'> | undefined = storage()) => {
  if (!TARGET_LEVELS.includes(level)) return;
  try {
    store?.setItem(`${KEY}:${user}`, level);
  } catch {
    return;
  }
};
