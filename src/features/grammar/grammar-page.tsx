import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { LibraryTabs } from '../../components/layout/library-tabs';
import { InlineMessage } from '../../components/ui/inline-message';
import { SearchField } from '../../components/ui/search-field';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { cn } from '../../lib/utils';
import { ListenButton } from '../practice/listen-button';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import type { GrammarRowProps } from './types';
import { useGrammar } from './use-grammar';

const GrammarRow = ({ point, isOpen, onToggle }: GrammarRowProps) => (
  <li>
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`${point.id}-body`}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-4 py-4 text-left hover:bg-surface"
    >
      <span className="min-w-0 flex-1">
        <span lang="zh-CN" className="block font-hanzi text-xl text-ink">
          {point.point}
        </span>
        <span className="block text-base text-muted">{point.title}</span>
      </span>
      <span className="hidden text-sm text-muted sm:block">
        <span lang="zh-CN">{point.detail || point.group}</span>
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn('size-5 shrink-0 text-muted transition-transform duration-150', isOpen && 'rotate-180')}
        strokeWidth={1.75}
      />
    </button>
    {isOpen && (
      <div id={`${point.id}-body`} className="flex flex-col gap-3 pb-5">
        {point.pattern && <p className="font-semibold text-strong">{point.pattern}</p>}
        <p className="text-base text-ink">{point.explanation}</p>
        <ul className="flex flex-col gap-3">
          {point.examples.map((example) => (
            <li key={example.zh} className="flex items-start gap-2 rounded-lg bg-surface px-4 py-3">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span lang="zh-CN" className="font-hanzi text-xl text-ink">
                  {example.zh}
                </span>
                <span className="text-sm text-muted">{example.py}</span>
                <span className="text-base text-ink">{example.en}</span>
              </span>
              <ListenButton text={example.zh} label="" className="shrink-0 px-2" />
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          <span lang="zh-CN">{point.category} · {point.group}</span>
        </p>
      </div>
    )}
  </li>
);

const GrammarPage = () => {
  usePageMeta('Grammar', 'Every grammar point of the HSK 3.0 syllabus, levels 1 to 9, explained with examples.');
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('level')) as HskLevel;
  const level = LEVELS.includes(requested) ? requested : 1;
  const query = params.get('q') ?? '';
  const grammar = useGrammar(level);
  const [open, setOpen] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const points = (grammar.data ?? []).filter(
    (p) =>
      !term ||
      p.point.includes(term) ||
      p.title.toLowerCase().includes(term) ||
      p.explanation.toLowerCase().includes(term) ||
      p.group.includes(term),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Library</h1>
        <p className="mt-1 text-base text-muted">The grammar points of the HSK 3.0 syllabus, each with a short explanation and examples.</p>
      </div>
      <LibraryTabs />
      <SegmentedControl
        label="Level"
        value={String(level)}
        onChange={(value) => setParams({ level: value }, { replace: true })}
        isWrapped
        options={LEVELS.map((l) => ({ value: String(l), label: levelLabel(l) }))}
      />
      <SearchField
        key={`grammar-${level}`}
        label="Search grammar"
        isLabelVisible
        value={query}
        placeholder="Pattern, like 把 or 是……的, or English"
        onChange={(q) => setParams(q ? { level: String(level), q } : { level: String(level) }, { replace: true })}
      />
      {grammar.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading grammar">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : grammar.isError ? (
        <InlineMessage tone="error">{grammar.error.message}</InlineMessage>
      ) : grammar.data.length === 0 ? (
        <p className="text-base text-muted">The notes for {levelLabel(level)} are not ready yet.</p>
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">
            {points.length} of {grammar.data.length} grammar points in {levelLabel(level)}
          </p>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {points.map((point) => (
              <GrammarRow
                key={point.id}
                point={point}
                isOpen={open === point.id}
                onToggle={() => setOpen(open === point.id ? null : point.id)}
              />
            ))}
          </ul>
          <p className="text-xs text-muted">
            Grammar points from the HSK 3.0 syllabus (2025). Explanations and examples are written for QuizLingo.
          </p>
        </>
      )}
    </div>
  );
};

export default GrammarPage;
