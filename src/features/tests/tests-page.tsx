import { ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { MOCK_FORMATS } from './mock-format';
import { useListeningLevel } from './use-listening';

const rowClasses = 'flex items-center justify-between gap-4 py-4 hover:bg-surface';

const TestsPage = () => {
  usePageMeta('Tests', 'HSK 3.0 listening tests with a script you can follow, and timed mock tests for every level.');
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('level')) as HskLevel;
  const level = LEVELS.includes(requested) ? requested : 1;
  const tests = useListeningLevel(level);
  const format = MOCK_FORMATS[level];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tests</h1>
        <p className="mt-1 text-base text-muted">Listening tests with a script you can follow, and timed mock tests in the HSK 3.0 format.</p>
      </div>
      <SegmentedControl
        label="Level"
        value={String(level)}
        onChange={(value) => setParams({ level: value }, { replace: true })}
        isWrapped
        options={LEVELS.map((l) => ({ value: String(l), label: levelLabel(l) }))}
      />

      <section aria-labelledby="mock-title" className="flex flex-col gap-3">
        <h2 id="mock-title" className="text-lg font-semibold text-ink">
          Mock test
        </h2>
        <Link to={`/tests/mock/${level}`} className={`${rowClasses} border-y border-hairline`}>
          <span>
            <span className="block text-base font-semibold text-ink">{levelLabel(level)} mock test</span>
            <span className="block text-sm text-muted">
              {format.sections.map((s) => `${s.label} ${s.count} questions, ${s.minutes} min`).join(' · ')}
            </span>
            <span className="block text-sm text-muted">
              Pass mark {format.pass} of {format.total}. Questions are built from QuizLingo content, not past papers.
            </span>
          </span>
          <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
        </Link>
      </section>

      <section aria-labelledby="listening-title" className="flex flex-col gap-3">
        <h2 id="listening-title" className="text-lg font-semibold text-ink">
          Listening tests
        </h2>
        {tests.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : tests.isError ? (
          <InlineMessage tone="error">{tests.error.message}</InlineMessage>
        ) : tests.data.length === 0 ? (
          <p className="text-base text-muted">No listening tests for this level yet.</p>
        ) : (
          <ul className="divide-y divide-hairline border-y border-hairline">
            {tests.data.map((test) => (
              <li key={test.id}>
                <Link to={`/tests/listening/${test.id}`} className={rowClasses}>
                  <span>
                    <span className="block text-base font-semibold text-ink">{test.title}</span>
                    <span className="block text-sm text-muted">
                      {test.scene}, {test.questions.length} questions
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TestsPage;
