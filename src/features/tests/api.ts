import { LEVELS } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import type { ListeningTest } from './types';

export const fetchListeningLevel = async (level: HskLevel): Promise<ListeningTest[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/listening-${level}.json`);
  if (!response.ok) return [];
  const tests = (await response.json()) as Omit<ListeningTest, 'level'>[];
  return tests.map((t) => ({ ...t, level }));
};

export const levelOfTestId = (id: string): HskLevel | null => {
  const level = Number(id.match(/^l(\d)-/)?.[1]);
  return LEVELS.includes(level as HskLevel) ? (level as HskLevel) : null;
};
