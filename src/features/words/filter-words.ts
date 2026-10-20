import type { WordProgress } from '../progress/types';
import { wordStatus } from '../progress/status';
import { LEVELS } from '../vocabulary/constants';
import { plainPinyin } from '../vocabulary/pinyin';
import type { HskLevel, Word } from '../vocabulary/types';
import { EMPTY_FILTERS, STATUS_ORDER } from './constants';
import type { SortDirection, SortKey, WordFilters, WordRow } from './types';

const list = <T>(value: string | null, allowed: readonly T[]) =>
  (value ?? '').split(',').filter((v) => allowed.map(String).includes(v)).map((v) => allowed.find((a) => String(a) === v)!);

export const filtersFromParams = (params: URLSearchParams): WordFilters => ({
  q: params.get('q') ?? '',
  word: params.get('word') ?? '',
  pinyin: params.get('pinyin') ?? '',
  meaning: params.get('meaning') ?? '',
  levels: list<HskLevel>(params.get('level'), LEVELS),
  statuses: list(params.get('status'), STATUS_ORDER),
  sort: (['pinyin', 'level', 'status', 'accuracy'] as SortKey[]).includes(params.get('sort') as SortKey)
    ? (params.get('sort') as SortKey)
    : EMPTY_FILTERS.sort,
  dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
  page: Math.max(1, Number(params.get('page')) || 1),
});

// Only non-default values go in the URL, so links stay short
export const filtersToParams = (filters: WordFilters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.word) params.set('word', filters.word);
  if (filters.pinyin) params.set('pinyin', filters.pinyin);
  if (filters.meaning) params.set('meaning', filters.meaning);
  if (filters.levels.length) params.set('level', filters.levels.join(','));
  if (filters.statuses.length) params.set('status', filters.statuses.join(','));
  if (filters.sort !== EMPTY_FILTERS.sort) params.set('sort', filters.sort);
  if (filters.dir !== EMPTY_FILTERS.dir) params.set('dir', filters.dir);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
};

export const toRows = (words: Word[], progress: Map<string, WordProgress>, now: number): WordRow[] =>
  words.map((word) => {
    const p = progress.get(word.hanzi);
    const answers = p ? p.correct + p.wrong : 0;
    return {
      ...word,
      status: wordStatus(p, now),
      answers,
      accuracy: answers === 0 ? null : Math.round(((p?.correct ?? 0) / answers) * 100),
    };
  });

const compare = (a: WordRow, b: WordRow, sort: SortKey): number => {
  if (sort === 'pinyin') return plainPinyin(a.pinyin).localeCompare(plainPinyin(b.pinyin));
  if (sort === 'status') return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (sort === 'accuracy') return (a.accuracy ?? -1) - (b.accuracy ?? -1);
  return a.level - b.level;
};

const matches = (row: WordRow, f: WordFilters) => {
  const meaning = row.readings.flatMap((r) => r.meanings).join(' ').toLowerCase();
  const pinyin = plainPinyin(row.pinyin);
  if (f.word && !row.hanzi.includes(f.word.trim()) && !row.traditional.includes(f.word.trim())) return false;
  if (f.pinyin && !pinyin.includes(plainPinyin(f.pinyin))) return false;
  if (f.meaning && !meaning.includes(f.meaning.trim().toLowerCase())) return false;
  if (f.levels.length && !f.levels.includes(row.level)) return false;
  if (f.statuses.length && !f.statuses.includes(row.status)) return false;
  if (f.q) {
    const q = f.q.trim().toLowerCase();
    const plainQ = plainPinyin(q);
    if (!row.hanzi.includes(q) && !(plainQ && pinyin.includes(plainQ)) && !meaning.includes(q)) return false;
  }
  return true;
};

// The word list is a fixed file shipped with the app, so filtering it here is instant
export const applyFilters = (rows: WordRow[], filters: WordFilters, direction: SortDirection = filters.dir) => {
  const filtered = rows.filter((row) => matches(row, filters));
  const sign = direction === 'asc' ? 1 : -1;
  return filtered.sort((a, b) => compare(a, b, filters.sort) * sign || a.level - b.level);
};
