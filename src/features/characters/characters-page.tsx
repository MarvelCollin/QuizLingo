import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ButtonLink } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { InlineMessage } from '../../components/ui/inline-message';
import { LibraryTabs } from '../../components/layout/library-tabs';
import { SearchField } from '../../components/ui/search-field';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useHanzi } from '../study/use-study-data';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { Pagination } from '../words/pagination';
import { applyCharacterFilters, CHARACTER_PAGE_SIZE, filtersFromParams, filtersToParams } from './filters';
import type { CharacterFilters, CharacterLevelFilter, CharacterRowsProps } from './types';

const writeNote = (level: number) => (level === 0 ? 'Read only' : `Write from ${levelLabel(level as HskLevel)}`);

const CharacterRows = ({ rows }: CharacterRowsProps) => (
  <ul className="divide-y divide-hairline border-y border-hairline">
    {rows.map((h) => (
      <li key={h.char}>
        <Link to={`/characters/${encodeURIComponent(h.char)}`} className="flex items-center gap-4 px-2 py-3 hover:bg-surface">
          <span lang="zh-CN" className="w-12 shrink-0 font-hanzi text-3xl text-ink">
            {h.char}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-strong">{h.pinyin}</span>
            <span className="block truncate text-base text-ink">{h.meanings.slice(0, 3).join(', ')}</span>
          </span>
          <span className="hidden w-28 text-sm text-muted sm:block">{levelLabel(h.level)}</span>
          <span className="w-32 text-right text-sm text-muted">{writeNote(h.writeLevel)}</span>
        </Link>
      </li>
    ))}
  </ul>
);

const CharactersPage = () => {
  usePageMeta('Characters', 'The 3,088 characters of HSK 3.0 levels 1 to 9, with stroke order and the 1,200 you need to write.');
  const hanzi = useHanzi();
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const [resetKey, setResetKey] = useState(0);
  const update = (change: Partial<CharacterFilters>) =>
    setParams(filtersToParams({ ...filters, page: 1, ...change }), { replace: true, preventScrollReset: true });

  const filtered = useMemo(() => applyCharacterFilters(hanzi.data ?? [], filters), [hanzi.data, filters]);
  const pageRows = filtered.slice((filters.page - 1) * CHARACTER_PAGE_SIZE, filters.page * CHARACTER_PAGE_SIZE);
  const practiceLevel = filters.level === 'all' ? '1' : filters.level;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Library</h1>
        <p className="mt-1 text-base text-muted">Every character of HSK 3.0, with its stroke order and the words that use it.</p>
      </div>
      <LibraryTabs />

      <div className="flex flex-wrap gap-3">
        <ButtonLink to={`/practice/characters?level=${practiceLevel}`}>Character quiz</ButtonLink>
        <ButtonLink to={`/practice/writing?level=${practiceLevel === '1' ? '2' : practiceLevel}`} variant="secondary">
          Writing practice
        </ButtonLink>
      </div>

      <SearchField
        key={`q-${resetKey}`}
        label="Search characters"
        isLabelVisible
        value={filters.q}
        placeholder="Character, pinyin or English"
        onChange={(q) => update({ q })}
      />
      <SegmentedControl
        label="Level"
        value={filters.level}
        onChange={(level) => update({ level })}
        isWrapped
        options={(['all', ...LEVELS.map(String)] as CharacterLevelFilter[]).map((value) => ({
          value,
          label: value === 'all' ? 'All levels' : levelLabel(Number(value) as HskLevel),
        }))}
      />
      <div className="max-w-xs">
        <Checkbox
          label="Only characters you need to write"
          isChecked={filters.isWriteOnly}
          onChange={(isWriteOnly) => update({ isWriteOnly })}
        />
      </div>

      {hanzi.isError ? (
        <InlineMessage tone="error">{hanzi.error.message}</InlineMessage>
      ) : hanzi.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading characters">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">
            {filtered.length.toLocaleString()} of {hanzi.data.length.toLocaleString()} characters
          </p>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border-y border-hairline py-10">
              <p className="text-lg font-semibold text-ink">No characters match</p>
              <button
                type="button"
                className="text-base font-semibold text-strong underline underline-offset-4"
                onClick={() => {
                  setParams(new URLSearchParams(), { replace: true });
                  setResetKey((k) => k + 1);
                }}
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <CharacterRows rows={pageRows} />
          )}
          <Pagination
            page={filters.page}
            pageSize={CHARACTER_PAGE_SIZE}
            total={filtered.length}
            onPage={(page) => update({ page })}
          />
        </>
      )}
    </div>
  );
};

export default CharactersPage;
