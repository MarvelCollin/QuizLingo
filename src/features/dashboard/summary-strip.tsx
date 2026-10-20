import { Link } from 'react-router';
import { percent, plural } from '../../lib/format';
import type { SummaryStripProps } from './types';

export const SummaryStrip = ({ mastered, totalWords, accuracy, streak }: SummaryStripProps) => (
  <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-hairline py-6 sm:grid-cols-[2fr_1fr_1fr]">
    <div className="col-span-2 sm:col-span-1">
      <dt className="text-sm font-medium text-muted">Words mastered</dt>
      <dd className="mt-1">
        <Link
          to="/words?status=mastered"
          aria-label={`${mastered} words mastered, show them`}
          className="text-3xl font-bold text-ink hover:text-strong"
        >
          {mastered.toLocaleString('en-US')}
        </Link>
        <span className="ml-2 text-base text-muted">
          of {totalWords.toLocaleString('en-US')} ({percent(mastered, totalWords)}%)
        </span>
      </dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-muted">Accuracy</dt>
      <dd className="mt-1 text-xl font-bold text-ink">{accuracy === null ? '0%' : `${accuracy}%`}</dd>
      <dd className="text-sm text-muted">{accuracy === null ? 'No answers yet' : 'of all your answers'}</dd>
    </div>
    <div>
      <dt className="text-sm font-medium text-muted">Streak</dt>
      <dd className="mt-1 text-xl font-bold text-ink">{plural(streak, 'day')}</dd>
      <dd className="text-sm text-muted">{streak === 0 ? 'Practice today to start one' : 'in a row'}</dd>
    </div>
  </dl>
);
