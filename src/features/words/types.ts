import type { ReactNode } from 'react';
import type { WordStatus } from '../progress/types';
import type { HskLevel, Word } from '../vocabulary/types';

export type SortKey = 'pinyin' | 'level' | 'status' | 'accuracy';
export type SortDirection = 'asc' | 'desc';

export type WordFilters = {
  q: string;
  word: string;
  pinyin: string;
  meaning: string;
  levels: HskLevel[];
  statuses: WordStatus[];
  sort: SortKey;
  dir: SortDirection;
  page: number;
};

export type WordRow = Word & { status: WordStatus; accuracy: number | null; answers: number };

export type WordTableProps = {
  rows: WordRow[];
  filters: WordFilters;
  resetKey: number;
  onChange: (change: Partial<WordFilters>) => void;
};

export type WordListMobileProps = { rows: WordRow[] };

export type SortHeaderProps = {
  label: string;
  sortKey?: SortKey;
  filters: WordFilters;
  onSort: (sort: SortKey) => void;
  filter: ReactNode;
  className?: string;
};

export type PaginationProps = { page: number; pageSize: number; total: number; onPage: (page: number) => void };

export type FilterProps = { filters: WordFilters; onChange: (change: Partial<WordFilters>) => void; resetKey: number };

export type ActiveFiltersProps = {
  filters: WordFilters;
  shown: number;
  total: number;
  onChange: (change: Partial<WordFilters>) => void;
  onClearAll: () => void;
};

export type WordPageContentProps = { word: Word };
