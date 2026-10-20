import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LibraryTabs } from '../../components/layout/library-tabs';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SearchField } from '../../components/ui/search-field';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useProgress } from '../progress/use-progress';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { ActiveFilters } from './active-filters';
import { LevelFilter, MeaningFilter, PinyinFilter, StatusFilter, WordFilter } from './column-filters';
import { PAGE_SIZE } from './constants';
import { applyFilters, toRows } from './filter-words';
import { Pagination } from './pagination';
import { useWordFilters } from './use-word-filters';
import { WordListMobile } from './word-list-mobile';
import { WordTable } from './word-table';
import type { WordFilters } from './types';

const TableSkeleton = () => (
  <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading words">
    <Skeleton className="h-11 w-full" />
    {Array.from({ length: 8 }, (_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

const countColumnFilters = (f: WordFilters) =>
  [f.word, f.pinyin, f.meaning].filter(Boolean).length + (f.levels.length > 0 ? 1 : 0) + (f.statuses.length > 0 ? 1 : 0);

const WordsPage = () => {
  usePageMeta('Words', 'Every HSK 3.0 word for levels 1 to 9 with pinyin, meaning and your progress on each.');
  const vocabulary = useVocabulary();
  const progress = useProgress();
  const { filters, update, clearAll } = useWordFilters();
  const [resetKey, setResetKey] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [now] = useState(() => Date.now());

  const rows = useMemo(
    () => (vocabulary.data ? toRows(vocabulary.data, progress.byWord, now) : []),
    [vocabulary.data, progress.byWord, now],
  );
  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const pageRows = filtered.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);

  const handleExternalChange = (change: Partial<WordFilters>) => {
    update(change);
    setResetKey((k) => k + 1);
  };
  const handleClearAll = () => {
    clearAll();
    setResetKey((k) => k + 1);
  };

  const columnFilterCount = countColumnFilters(filters);
  const filterProps = { filters, onChange: update, resetKey };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Library</h1>
        <p className="mt-1 text-base text-muted">All HSK 3.0 words for levels 1 to 9, with your progress on each.</p>
      </div>
      <LibraryTabs />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <SearchField
          key={`q-${resetKey}`}
          label="Search words"
          isLabelVisible
          value={filters.q}
          placeholder="Characters, pinyin or English"
          onChange={(q) => update({ q })}
          className="flex-1"
        />
        <Button
          variant="secondary"
          className="md:hidden"
          aria-expanded={isSheetOpen}
          aria-controls="word-filters"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={1.75} />
          Filters{columnFilterCount > 0 ? ` (${columnFilterCount})` : ''}
        </Button>
      </div>

      {isSheetOpen && (
        <div id="word-filters" className="grid gap-4 rounded-lg bg-surface p-4 md:hidden">
          <WordFilter {...filterProps} isLabelVisible />
          <PinyinFilter {...filterProps} isLabelVisible />
          <MeaningFilter {...filterProps} isLabelVisible />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Level</span>
              <LevelFilter filters={filters} onChange={update} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Status</span>
              <StatusFilter filters={filters} onChange={update} />
            </div>
          </div>
        </div>
      )}

      {vocabulary.isError || progress.isError ? (
        <InlineMessage tone="error">{(vocabulary.error ?? progress.error)?.message}</InlineMessage>
      ) : vocabulary.isPending || progress.isPending ? (
        <TableSkeleton />
      ) : (
        <>
          <ActiveFilters
            filters={filters}
            shown={filtered.length}
            total={rows.length}
            onChange={handleExternalChange}
            onClearAll={handleClearAll}
          />
          {filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border-y border-hairline py-10">
              <p className="text-lg font-semibold text-ink">No words match these filters</p>
              <Button variant="secondary" onClick={handleClearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <WordTable rows={pageRows} {...filterProps} />
              </div>
              <div className="md:hidden">
                <WordListMobile rows={pageRows} />
              </div>
            </>
          )}
          <Pagination
            page={filters.page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPage={(page) => update({ page })}
          />
        </>
      )}
    </div>
  );
};

export default WordsPage;
