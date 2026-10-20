import { ButtonLink } from '../../components/ui/button';
import { configToSearch } from '../practice/round-config';
import { STAGES } from './curriculum';
import { Stamp } from './stamp';
import type { NextLessonProps } from './types';

// The one thing to do now, the same idea as the review card on the home page
export const NextLesson = ({ next, stagesDone, isFresh }: NextLessonProps) => {
  if (!next) {
    return (
      <section aria-labelledby="next-title" className="flex flex-wrap items-center gap-6 rounded-xl bg-surface px-6 py-8 sm:px-8">
        <Stamp kind="milestone" />
        <div className="min-w-0 flex-1">
          <h2 id="next-title" className="text-2xl font-bold text-ink">
            You finished the starter path
          </h2>
          <p className="mt-2 max-w-prose text-base text-muted">
            You can hear the tones, read the first sounds of pinyin and write the basic strokes. The 300 words of HSK 1 are next.
          </p>
          <ButtonLink
            className="mt-6"
            size="lg"
            to={`/practice/round${configToSearch({ mode: 'flashcard', set: 'new', level: '1', size: '10' })}`}
          >
            Learn your first HSK 1 words
          </ButtonLink>
        </div>
      </section>
    );
  }

  const { lesson, stage, isCheckpoint, status } = next;
  const heading = isFresh ? 'Start here' : isCheckpoint ? `Milestone: ${stage.title}` : lesson.title;
  const body = isFresh
    ? `${STAGES.length} short stages take you from hearing the four tones to your first words. Each lesson takes a few minutes and you can stop after any of them.`
    : isCheckpoint
      ? 'Ten questions on everything in this stage. Pass it to open the next stage.'
      : `${stage.title}, ${lesson.summary.toLowerCase()}.`;
  const action = isFresh
    ? `Start with ${lesson.title.toLowerCase()}`
    : status === 'tried'
      ? 'Try again'
      : isCheckpoint
        ? 'Take the milestone'
        : 'Continue';

  return (
    <section aria-labelledby="next-title" className="rounded-xl bg-surface px-6 py-8 sm:px-8">
      <p className="text-sm text-muted">
        {isFresh ? 'Zero to HSK 1' : `Stage ${STAGES.indexOf(stage) + 1} of ${STAGES.length}, ${stagesDone} passed`}
      </p>
      <h2 id="next-title" className="mt-1 text-2xl font-bold text-ink">
        {heading}
      </h2>
      <p className="mt-2 max-w-prose text-base text-muted">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink size="lg" to={`/basics/${lesson.id}`}>
          {action}
        </ButtonLink>
        <span className="text-sm text-muted">About {lesson.minutes} minutes</span>
      </div>
    </section>
  );
};
