import type { WordStatus } from '../progress/types';
import type { WordFilters } from './types';

export const PAGE_SIZE = 50;

export const STATUS_ORDER: WordStatus[] = ['due', 'learning', 'new', 'mastered'];

export const EMPTY_FILTERS: WordFilters = {
  q: '',
  word: '',
  pinyin: '',
  meaning: '',
  levels: [],
  statuses: [],
  sort: 'level',
  dir: 'asc',
  page: 1,
};
