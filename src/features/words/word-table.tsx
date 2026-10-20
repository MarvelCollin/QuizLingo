import { Link } from 'react-router';
import { StatusLabel } from '../progress/status-label';
import { ListenButton } from '../practice/listen-button';
import { LevelFilter, MeaningFilter, PinyinFilter, StatusFilter, WordFilter } from './column-filters';
import { SortHeader } from './sort-header';
import type { SortKey } from './types';
import type { WordTableProps } from './types';

// Wide screens: a table with a sort and a filter in every column header
export const WordTable = ({ rows, filters, resetKey, onChange }: WordTableProps) => {
  const handleSort = (sort: SortKey) =>
    onChange({ sort, dir: filters.sort === sort && filters.dir === 'asc' ? 'desc' : 'asc', page: filters.page });
  const shared = { filters, onSort: handleSort };

  return (
    <div
      className="max-h-[70dvh] overflow-auto rounded-lg border border-hairline"
      tabIndex={0}
      role="region"
      aria-label="Word list"
    >
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-surface align-top">
          <tr className="[&>th]:px-3">
            <SortHeader
              label="Word"
              {...shared}
              className="sticky left-0 bg-surface"
              filter={<WordFilter filters={filters} onChange={onChange} resetKey={resetKey} />}
            />
            <SortHeader label="Pinyin" sortKey="pinyin" {...shared} filter={<PinyinFilter filters={filters} onChange={onChange} resetKey={resetKey} />} />
            <SortHeader label="Meaning" {...shared} filter={<MeaningFilter filters={filters} onChange={onChange} resetKey={resetKey} />} />
            <SortHeader label="Level" sortKey="level" {...shared} filter={<LevelFilter filters={filters} onChange={onChange} />} />
            <SortHeader label="Status" sortKey="status" {...shared} filter={<StatusFilter filters={filters} onChange={onChange} />} />
            <SortHeader label="Accuracy" sortKey="accuracy" {...shared} filter={null} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.hanzi} className="border-t border-hairline hover:bg-surface/60 [&>td]:px-3 [&>td]:py-2.5">
              <th scope="row" className="sticky left-0 bg-bg px-3 py-2.5 font-normal">
                <span className="flex items-center gap-1">
                  <Link
                    to={`/words/${encodeURIComponent(row.hanzi)}`}
                    lang="zh-CN"
                    className="rounded-sm font-hanzi text-2xl text-ink underline-offset-4 hover:underline"
                  >
                    {row.hanzi}
                  </Link>
                  <ListenButton text={row.hanzi} label="" className="px-2" />
                </span>
              </th>
              <td className="font-semibold whitespace-nowrap text-strong">{row.pinyin}</td>
              <td className="max-w-xs text-ink">{row.readings.flatMap((r) => r.meanings).slice(0, 3).join(', ')}</td>
              <td className="whitespace-nowrap text-ink">HSK {row.level}</td>
              <td>
                <StatusLabel status={row.status} />
              </td>
              <td className="whitespace-nowrap text-muted">
                {row.accuracy === null ? 'Not yet' : `${row.accuracy}% of ${row.answers}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
