import { ButtonLink } from '../../components/ui/button';
import { plural } from '../../lib/format';
import { configToSearch } from '../practice/round-config';
import type { NextStepProps } from './types';

export const NextStep = ({ due, nextNewLevel, stepReady, isFirstVisit }: NextStepProps) => {
  if (due > 0) {
    return (
      <section aria-labelledby="next-title" className="rounded-xl bg-surface px-6 py-8 sm:px-8">
        <h2 id="next-title" className="text-3xl font-bold text-ink">
          {plural(due, 'word')} to review
        </h2>
        <p className="mt-2 max-w-prose text-base text-muted">
          These are words you have seen before that are due today. Reviewing them now is what makes them stick.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink
            size="lg"
            to={`/practice/round${configToSearch({ mode: 'meaning', set: 'due', level: 'all' })}`}
          >
            Review now
          </ButtonLink>
          <ButtonLink size="lg" variant="quiet" to="/practice?set=due&level=all">
            Choose how to review
          </ButtonLink>
        </div>
      </section>
    );
  }

  if (!nextNewLevel) {
    return (
      <section className="rounded-xl bg-surface px-6 py-8 sm:px-8">
        <h2 className="text-2xl font-bold text-ink">Nothing due right now</h2>
        <p className="mt-2 text-base text-muted">
          You have started every word in HSK 1 to 9. Come back when reviews are due, or run a mixed round.
        </p>
        <ButtonLink className="mt-6" size="lg" to="/practice?set=all&level=all">
          Practice a mixed round
        </ButtonLink>
      </section>
    );
  }

  if (stepReady === 0) {
    return (
      <section aria-labelledby="next-title" className="rounded-xl bg-surface px-6 py-8 sm:px-8">
        <h2 id="next-title" className="text-2xl font-bold text-ink">
          Your open words are resting
        </h2>
        <p className="mt-2 max-w-prose text-base text-muted">
          Every word in your current HSK {nextNewLevel} step has been practiced. Words stick better when you recall them
          again after a gap, so they come back when they are due. Once you know most of them, the next words open.
        </p>
        <ButtonLink className="mt-6" size="lg" variant="quiet" to={`/practice?set=step&level=${nextNewLevel}`}>
          See your step
        </ButtonLink>
      </section>
    );
  }

  return (
    <section aria-labelledby="next-title" className="rounded-xl bg-surface px-6 py-8 sm:px-8">
      <h2 id="next-title" className="text-2xl font-bold text-ink">
        {isFirstVisit ? 'Start with HSK 1' : `Learn new HSK ${nextNewLevel} words`}
      </h2>
      <p className="mt-2 max-w-prose text-base text-muted">
        {isFirstVisit
          ? 'Pick the meaning of each word. Words you miss come back a few cards later, and words you know are hidden for longer each time.'
          : 'Nothing is due for review, so this is a good moment to learn the next words in your step.'}
      </p>
      <ButtonLink
        className="mt-6"
        size="lg"
        to={`/practice/round${configToSearch({ mode: 'meaning', set: 'step', level: nextNewLevel })}`}
      >
        Learn the next words
      </ButtonLink>
    </section>
  );
};
