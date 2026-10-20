import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortHeaderProps } from './types';

// A column header: the sort button on top, the column's filter underneath
export const SortHeader = ({ label, sortKey, filters, onSort, filter, className }: SortHeaderProps) => {
  const isSorted = sortKey !== undefined && filters.sort === sortKey;
  const Icon = !isSorted ? ArrowUpDown : filters.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={isSorted ? (filters.dir === 'asc' ? 'ascending' : 'descending') : sortKey ? 'none' : undefined}
      className={className}
    >
      <div className="flex flex-col gap-1.5 py-2 text-left">
        {sortKey ? (
          <button
            type="button"
            onClick={() => onSort(sortKey)}
            className="inline-flex min-h-8 cursor-pointer items-center gap-1 self-start text-sm font-semibold text-ink hover:text-strong"
          >
            {label}
            <Icon aria-hidden="true" className={isSorted ? 'size-3.5 text-strong' : 'size-3.5 text-muted'} strokeWidth={2} />
          </button>
        ) : (
          <span className="inline-flex min-h-8 items-center text-sm font-semibold text-ink">{label}</span>
        )}
        {filter}
      </div>
    </th>
  );
};
