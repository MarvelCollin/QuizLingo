import { plainPinyin } from '../vocabulary/pinyin';
import type { Hanzi } from '../study/types';
import type { CharacterFilters, CharacterLevelFilter } from './types';

export const CHARACTER_PAGE_SIZE = 60;

const LEVEL_VALUES: CharacterLevelFilter[] = ['all', '1', '2', '3', '4', '5', '6', '7'];

export const filtersFromParams = (params: URLSearchParams): CharacterFilters => {
  const level = params.get('level') as CharacterLevelFilter | null;
  const page = Number(params.get('page'));
  return {
    q: params.get('q') ?? '',
    level: level && LEVEL_VALUES.includes(level) ? level : 'all',
    isWriteOnly: params.get('write') === '1',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
};

export const filtersToParams = (f: CharacterFilters) => {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.level !== 'all') params.set('level', f.level);
  if (f.isWriteOnly) params.set('write', '1');
  if (f.page > 1) params.set('page', String(f.page));
  return params;
};

export const applyCharacterFilters = (rows: Hanzi[], f: CharacterFilters) => {
  const query = f.q.trim().toLowerCase();
  const plain = plainPinyin(query);
  return rows.filter((h) => {
    if (f.level !== 'all' && h.level !== Number(f.level)) return false;
    if (f.isWriteOnly && h.writeLevel === 0) return false;
    if (!query) return true;
    return (
      h.char.includes(query) ||
      (plain.length > 0 && plainPinyin(h.pinyin).startsWith(plain)) ||
      h.meanings.some((m) => m.toLowerCase().includes(query))
    );
  });
};
