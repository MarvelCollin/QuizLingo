import { Button, ButtonLink } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { levelLabel } from '../vocabulary/constants';
import { scoreSections } from './mock-score';
import type { MockResultsProps } from './mock-types';

export const MockResults = ({ paper, answers, onReview, onRestart }: MockResultsProps) => {
  const sections = scoreSections(paper, answers);
  const points = sections.reduce((sum, s) => sum + s.points, 0);
  const max = sections.length * 100;
  const pass = Math.round((paper.format.pass / paper.format.total) * max);
  const passed = points >= pass;
  const weakest = [...sections].sort((a, b) => a.points - b.points)[0];

  return (
    <section aria-labelledby="results-title" className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <p className="text-sm text-muted">{levelLabel(paper.level)} mock test</p>
        <h1 id="results-title" className="text-2xl font-bold text-ink">
          Your result
        </h1>
        <p className="mt-3 text-4xl font-bold text-strong">
          {points} <span className="text-xl font-semibold text-muted">of {max}</span>
        </p>
        <p className={cn('mt-1 text-lg font-semibold', passed ? 'text-ok-strong' : 'text-bad-strong')}>
          {passed ? 'Passed' : `${pass - points} points short of the pass mark of ${pass}`}
        </p>
        {!passed && weakest && <p className="mt-1 text-base text-muted">Most points were lost in {weakest.label.toLowerCase()}.</p>}
        {paper.format.isScoringEstimated && (
          <p className="mt-2 text-sm text-muted">
            The official scoring for this level under HSK 3.0 is not published yet. This uses 100 points per section and a 60 percent pass mark.
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <li key={s.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-semibold text-ink">{s.label}</span>
              <span className="text-base text-muted">
                <span className="font-semibold text-ink">{s.points}</span> of 100, {s.correct} of {s.total} right
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-tint" aria-hidden="true">
              <div className="h-3 rounded-full bg-strong" style={{ width: `${s.points}%` }} />
              <div className="absolute top-[-4px] h-5 w-0.5 bg-ink" style={{ left: '60%' }} />
            </div>
            <Button variant="quiet" className="self-start" onClick={() => onReview(i, 0)}>
              Review {s.label.toLowerCase()}
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">The line on each bar marks 60 percent.</p>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onRestart}>
          Take a new mock test
        </Button>
        <ButtonLink to={`/tests?level=${paper.level}`} size="lg" variant="secondary">
          Back to tests
        </ButtonLink>
      </div>
    </section>
  );
};
