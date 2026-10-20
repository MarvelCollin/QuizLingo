import { X } from 'lucide-react';
import { STATUS_LABELS } from '../progress/status';
import type { WordFilters } from './types';
import type { ActiveFiltersProps } from './types';

// "Showing 12 of 10,896, filtered by ..." with a way to remove each filter and all of them
export const ActiveFilters = ({ filters, shown, total, onChange, onClearAll }: ActiveFiltersProps) => {
  const active = [
    filters.q && { label: `Search: ${filters.q}`, clear: { q: '' } },
    filters.word && { label: `Word: ${filters.word}`, clear: { word: '' } },
    filters.pinyin && { label: `Pinyin: ${filters.pinyin}`, clear: { pinyin: '' } },
    filters.meaning && { label: `Meaning: ${filters.meaning}`, clear: { meaning: '' } },
    filters.levels.length > 0 && {
      label: `Level: ${filters.levels.map((l) => `HSK ${l}`).join(', ')}`,
      clear: { levels: [] },
    },
    filters.statuses.length > 0 && {
      label: `Status: ${filters.statuses.map((s) => STATUS_LABELS[s]).join(', ')}`,
      clear: { statuses: [] },
    },
  ].filter(Boolean) as { label: string; clear: Partial<WordFilters> }[];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-live="polite">
      <span className="text-muted">
        Showing <span className="font-semibold text-ink">{shown.toLocaleString()}</span> of {total.toLocaleString()}
        {active.length > 0 && ', filtered by'}
      </span>
      {active.map((filter) => (
        <button
          key={filter.label}
          type="button"
          onClick={() => onChange(filter.clear)}
          aria-label={`Remove filter ${filter.label}`}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-sm border border-line/60 px-2 text-ink hover:border-strong"
        >
          {filter.label}
          <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
        </button>
      ))}
      {active.length > 1 && (
        <button type="button" onClick={onClearAll} className="min-h-9 cursor-pointer font-semibold text-strong underline underline-offset-4">
          Clear all
        </button>
      )}
    </div>
  );
};
