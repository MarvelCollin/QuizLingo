import { Link } from 'react-router';
import { StackedBar } from '../../components/ui/stacked-bar';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { LevelProgressProps } from './types';

export const LevelProgress = ({ totals, stats }: LevelProgressProps) => (
  <section aria-labelledby="levels-title">
    <h2 id="levels-title" className="text-lg font-semibold text-ink">
      Progress by level
    </h2>
    <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
      {LEVELS.map((level) => {
        const s = stats.find((x) => x.level === level) ?? { seen: 0, mastered: 0, due: 0 };
        const total = totals[level];
        const learning = s.seen - s.mastered;
        return (
          <li key={level} className="grid gap-x-6 gap-y-2 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
            <div>
              <p className="font-semibold text-ink">{levelLabel(level)}</p>
              <p className="text-sm text-muted">{total.toLocaleString()} new words</p>
            </div>
            <div>
              <StackedBar
                label={`HSK ${level}`}
                total={total}
                segments={[
                  { label: 'mastered', value: s.mastered, className: 'bg-strong' },
                  { label: 'learning', value: learning, className: 'bg-line' },
                ]}
              />
              <p className="mt-1.5 text-sm text-muted">
                <span className="font-semibold text-ink">{s.mastered} mastered</span>, {learning} learning,{' '}
                {Math.max(total - s.seen, 0).toLocaleString()} not started
              </p>
            </div>
            <Link
              to={`/practice?level=${level}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-strong underline-offset-4 hover:underline"
            >
              Practice {levelLabel(level)}
            </Link>
          </li>
        );
      })}
    </ul>
  </section>
);
